import os
os.environ["OPENCV_VIDEOIO_DEBUG"] = "0"

import cv2
import time
import glob
import base64
import socketio
import threading
import numpy as np
import requests
import json
from io import BytesIO
from collections import deque

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
MODEL_URL          = "http://localhost/image"
BACKEND_API_URL    = "http://192.168.0.104:5000/api/v1/inferences"
BACKEND_SOCKET_URL = "http://192.168.0.104:5000"

CAMERA_WIDTH  = 640
CAMERA_HEIGHT = 480

STREAM_FPS     = 20
STREAM_QUALITY = 100
STREAM_SCALE   = 0.75
# ───── AI INFERENCE CONFIG ─────
MODEL_URL          = "http://127.0.0.1/image"  # Custom Vision Docker endpoint
INFERENCE_INTERVAL = 2.0                        # Classify every 2 seconds
CONFIDENCE_THRESHOLD = 0.5                      # Only report predictions > 50%
SNAPSHOT_DIR       = "/mnt/web_snapshots"       # SMB mount of Windows web-app path
BOARD_BASELINE_NODES = {0, 1}

# ─────────────────────────────────────────────
# SOCKET.IO
# ─────────────────────────────────────────────

sio = socketio.Client(
    reconnection=True,
    reconnection_attempts=0,
    reconnection_delay=3,
    logger=False,
    engineio_logger=False
)

@sio.event
def connect():
    print("✅ WebSocket connected")

@sio.event
def disconnect():
    print("⚠️  WebSocket disconnected")

# ─────────────────────────────────────────────
# AI EVENT HANDLERS (DISABLED FOR NOW)
# ─────────────────────────────────────────────
# Uncomment if backend needs to control inference state
# is_classifying = False
# @sio.event
# def classification_state(data):
#     global is_classifying
#     is_classifying = data.get("active", False)
#     print(f"🤖 Classification: {'ON' if is_classifying else 'OFF'}")

def socket_loop():
    while True:
        if not sio.connected:
            try:
                sio.connect(BACKEND_SOCKET_URL)
            except Exception as e:
                print("⚠️  Socket reconnect failed:", e)
                time.sleep(3)

threading.Thread(
    target=socket_loop,
    daemon=True
).start()


# ─────────────────────────────────────────────
# CAMERA DISCOVERY
# ─────────────────────────────────────────────

def camera_indices_from_by_id():
    indices = []

    for path in glob.glob("/dev/v4l/by-id/*"):
        try:
            target = os.path.realpath(path)

            if "/dev/video" not in target:
                continue

            idx = int(target.replace("/dev/video", ""))

            if idx < 20 and idx not in BOARD_BASELINE_NODES:
                indices.append(idx)

        except:
            pass

    return sorted(set(indices))

def find_camera_indices():
    preferred = camera_indices_from_by_id()

    if preferred:
        return preferred

    all_indices = set()

    for path in glob.glob("/dev/video*"):
        try:
            idx = int(path.replace("/dev/video", ""))

            if idx < 20:
                all_indices.add(idx)

        except:
            pass

    return sorted(all_indices - BOARD_BASELINE_NODES)

# ─────────────────────────────────────────────
# CAMERA THREAD
# ─────────────────────────────────────────────

class CameraReader(threading.Thread):

    def __init__(self):
        super().__init__(daemon=True)

        self.cap = None

        self.running = True
        self.ready = False

        self.lock = threading.Lock()

        self.frame = None

    # ─────────────────────────
    # frame validation
    # ─────────────────────────
    def is_valid_frame(self, frame):

        if frame is None:
            return False

        if frame.size == 0:
            return False

        if np.max(frame) < 10:
            return False

        if np.min(frame) > 245:
            return False

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if np.var(gray) < 1.0:
            return False

        return True

    # ─────────────────────────
    # open camera
    # ─────────────────────────
    def try_open(self, index):

        path = f"/dev/video{index}"

        print(f"📷 Opening {path}")

        cap = cv2.VideoCapture(
            path,
            cv2.CAP_V4L2
        )

        if not cap.isOpened():
            print(f"❌ Cannot open {path}")
            return None

        # VERY IMPORTANT ORDER
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        cap.set(
            cv2.CAP_PROP_FRAME_WIDTH,
            CAMERA_WIDTH
        )

        cap.set(
            cv2.CAP_PROP_FRAME_HEIGHT,
            CAMERA_HEIGHT
        )

        cap.set(
            cv2.CAP_PROP_FOURCC,
            cv2.VideoWriter_fourcc(*'MJPG')
        )

        # DO NOT SET FPS
        # DO NOT SET EXPOSURE
        # DO NOT SET AUTOFOCUS

        # warmup
        print("⏳ Camera warmup...")

        start = time.time()

        ok_frames = 0

        while time.time() - start < 2:

            ret, frame = cap.read()

            if ret and self.is_valid_frame(frame):
                ok_frames += 1

            time.sleep(0.03)

        if ok_frames > 5:
            print(f"✅ Camera OK: {path}")
            return cap

        cap.release()

        print(f"❌ Warmup failed: {path}")

        return None

    # ─────────────────────────
    # open any available camera
    # ─────────────────────────
    def open_camera(self):

        indices = find_camera_indices()

        if not indices:
            return None

        print(
            "🔍 Found:",
            [f"/dev/video{i}" for i in indices]
        )

        for idx in indices:

            cap = self.try_open(idx)

            if cap is not None:
                return cap

        return None

    # ─────────────────────────
    # main loop
    # ─────────────────────────
    def run(self):

        fail_count = 0

        while self.running:

            # reconnect camera
            if self.cap is None:

                self.ready = False

                print("🔍 Searching camera...")

                self.cap = self.open_camera()

                if self.cap is None:
                    print("⏳ No camera found")
                    time.sleep(3)
                    continue

                self.ready = True
                fail_count = 0

            # read frame
            ret, frame = self.cap.read()

            if not ret or frame is None:

                fail_count += 1

                print(f"⚠️  Camera read fail [{fail_count}]")

                time.sleep(0.05)

                # reset camera
                if fail_count >= 5:

                    print("🔄 Resetting camera...")

                    try:
                        self.cap.release()
                    except:
                        pass

                    self.cap = None

                    time.sleep(2)

                continue

            # validate
            if not self.is_valid_frame(frame):
                continue

            fail_count = 0

            with self.lock:
                self.frame = frame

    # ─────────────────────────
    # get latest frame
    # ─────────────────────────
    def get_frame(self):

        with self.lock:

            if self.frame is None:
                return None

            return self.frame.copy()

    # ─────────────────────────
    # stop
    # ─────────────────────────
    def stop(self):

        self.running = False

        if self.cap is not None:
            self.cap.release()

# ─────────────────────────────────────────────
# AI INFERENCE WORKER (Custom Vision)
# ─────────────────────────────────────────────

class InferenceWorker(threading.Thread):
    """Thread riêng cho AI: gửi frame tới Custom Vision model."""

    def __init__(self):
        super().__init__(daemon=True)
        self.queue = deque(maxlen=1)      # Chỉ giữ frame mới nhất
        self.event = threading.Event()
        self.running = True

    def submit(self, frame):
        """Đưa frame vào queue để classify."""
        self.queue.append(frame)
        self.event.set()

    def run(self):
        """Classify frames từ queue."""
        while self.running:
            self.event.wait(timeout=2)  # Chờ frame hoặc timeout
            self.event.clear()

            if not self.queue:
                continue

            frame = self.queue.pop()

            # Encode frame thành JPEG bytes
            _, buffer = cv2.imencode('.jpg', frame)
            image_bytes = buffer.tobytes()

            try:
                # Gửi tới Custom Vision endpoint
                files = {'imageData': BytesIO(image_bytes)}
                response = requests.post(
                    MODEL_URL,
                    files=files,
                    timeout=5
                )
                response.raise_for_status()

                # Parse Custom Vision response
                result = response.json()
                self._process_result(frame, result)

            except requests.exceptions.Timeout:
                print("⏱️  Model inference timeout")
            except requests.exceptions.ConnectionError:
                print(f"❌ Cannot connect to model at {MODEL_URL}")
            except Exception as e:
                print(f"⚠️  Inference error: {e}")

    def _process_result(self, frame, result):
        """Parse Custom Vision response và in kết quả."""
        try:
            # Custom Vision response structure:
            # { "predictions": [ { "tagName": "...", "probability": 0.95 }, ... ] }
            predictions = result.get('predictions', [])

            if not predictions:
                print("⚠️  No predictions returned")
                return

            # Lấy prediction có confidence cao nhất
            best = max(predictions, key=lambda x: x.get('probability', 0))
            tag_name = best.get('tagName', 'Unknown')
            probability = best.get('probability', 0)

            # Filter theo confidence threshold
            if probability < CONFIDENCE_THRESHOLD:
                print(f"📊 {tag_name}: {probability:.1%} (below threshold)")
                return

            # In kết quả
            print(f"🎯 {tag_name}: {probability:.1%}")

            # Save snapshot (optional)
            self._save_snapshot(frame, tag_name, probability)

            # Emit tới backend socket (optional)
            self._emit_result(tag_name, probability)

        except Exception as e:
            print(f"⚠️  Error parsing result: {e}")

    def _save_snapshot(self, frame, tag_name, probability):
        """Lưu ảnh đã classify vào SNAPSHOT_DIR."""
        try:
            import os
            os.makedirs(SNAPSHOT_DIR, exist_ok=True)

            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = f"{SNAPSHOT_DIR}/{tag_name}_{probability:.0%}_{timestamp}.jpg"
            cv2.imwrite(filename, frame)
            print(f"📸 Saved: {filename}")
        except Exception as e:
            print(f"⚠️  Cannot save snapshot: {e}")

    def _emit_result(self, tag_name, probability):
        """Gửi kết quả tới backend qua WebSocket (optional)."""
        try:
            if sio.connected:
                sio.emit('classification_result', {
                    'fruit_type': 'APPLE',  # Or detect from tag_name
                    'quality_status': tag_name,
                    'confidence': round(probability * 100, 2),
                    'timestamp': time.time()
                })
        except Exception:
            pass  # Silent fail

    def stop(self):
        self.running = False
        self.event.set()


# ─────────────────────────────────────────────
# STREAM WORKER
# ─────────────────────────────────────────────

class StreamWorker(threading.Thread):

    def __init__(self):
        super().__init__(daemon=True)

        self.queue = deque(maxlen=1)

        self.event = threading.Event()

        self.running = True

    def submit(self, data):

        self.queue.append(data)

        self.event.set()

    def run(self):

        while self.running:

            self.event.wait(timeout=1)

            self.event.clear()

            if not self.queue:
                continue

            if not sio.connected:
                self.queue.clear()
                continue

            data = self.queue.pop()

            try:
                sio.emit(
                    "video_frame_upstream",
                    data
                )

            except:
                pass

    def stop(self):

        self.running = False

        self.event.set()

# ─────────────────────────────────────────────
# START THREADS
# ─────────────────────────────────────────────

cam = CameraReader()

inferrer = InferenceWorker()

streamer = StreamWorker()

cam.start()

inferrer.start()

streamer.start()

print("⏳ Waiting camera...")

while not cam.ready:
    time.sleep(0.5)

print("🎥 Streaming started")
print(f"🤖 AI inference: {MODEL_URL}")

# ─────────────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────────────

stream_interval = 1.0 / STREAM_FPS

last_stream = 0
last_infer = 0

encode_params = [
    cv2.IMWRITE_JPEG_QUALITY,
    STREAM_QUALITY
]

while True:

    now = time.time()

    # throttle FPS
    if now - last_stream < stream_interval:
        time.sleep(0.005)
        continue

    frame = cam.get_frame()

    if frame is None:
        time.sleep(0.05)
        continue

    last_stream = now

    # resize
    if STREAM_SCALE != 1.0:

        frame = cv2.resize(
            frame,
            (0, 0),
            fx=STREAM_SCALE,
            fy=STREAM_SCALE,
            interpolation=cv2.INTER_NEAREST
        )

    # encode JPEG
    ok, buffer = cv2.imencode(
        ".jpg",
        frame,
        encode_params
    )

    if not ok:
        continue

    b64 = base64.b64encode(buffer).decode("utf-8")

    streamer.submit(
        f"data:image/jpeg;base64,{b64}"
    )

    # ───── AI INFERENCE: mỗi 2 giây ─────
    if now - last_infer >= INFERENCE_INTERVAL:
        # Get full-size frame for AI (not resized)
        full_frame = cam.get_frame()
        if full_frame is not None:
            inferrer.submit(full_frame)  # Non-blocking
        last_infer = now