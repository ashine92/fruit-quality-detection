import cv2
import time
import requests
import base64
import socketio
import numpy as np
import os
import threading
from collections import deque
import glob

# ─────────────────────────────────────────────
# 1. CẤU HÌNH
# ─────────────────────────────────────────────
MODEL_URL          = "http://localhost/image"
BACKEND_API_URL    = "http://192.168.0.104:5000/api/v1/inferences"
BACKEND_SOCKET_URL = "http://192.168.0.104:5000"

# Bỏ hardcode device path — tự động quét khi khởi động và khi reconnect
CAMERA_WIDTH       = 640
CAMERA_HEIGHT      = 480

STREAM_FPS         = 20       # FPS gửi lên WebSocket (20fps mượt hơn)
STREAM_QUALITY     = 70       # JPEG quality cho stream (cao hơn = sắc nét hơn)
STREAM_SCALE       = 0.75     # Scale xuống 75% trước khi encode (480x360)
INFERENCE_INTERVAL = 5.0      # Chạy AI mỗi 5 giây và chụp ảnh lưu DB

# ─────────────────────────────────────────────
# 2. SOCKET.IO CLIENT
# ─────────────────────────────────────────────
sio = socketio.Client(reconnection=True, reconnection_attempts=0,
                      reconnection_delay=3, logger=False, engineio_logger=False)

@sio.event
def connect():
    print("✅ WebSocket: Đã kết nối!")

@sio.event
def disconnect():
    print("⚠️  WebSocket: Mất kết nối...")

def _socket_connect_loop():
    """Thread kết nối socket — tự thử lại nếu thất bại."""
    while True:
        if not sio.connected:
            try:
                sio.connect(BACKEND_SOCKET_URL)
            except Exception as e:
                print("⚠️  Socket kết nối thất bại, thử lại sau 3s:", e)
                time.sleep(3)
        time.sleep(5)

threading.Thread(target=_socket_connect_loop, daemon=True, name="SocketThread").start()
time.sleep(1)


# ─────────────────────────────────────────────
# 3. THREADED CAMERA READER
# ─────────────────────────────────────────────
# Trên qcs6490-odk:
#   /dev/video0, /dev/video1 — ISP pipeline nodes, KHÔNG BAO GIỜ là camera USB
#   /dev/video2, /dev/video3 — USB Camera (khi cắm vào)
#   /dev/video32, video33    — VIDC codec (bỏ qua)
BOARD_BASELINE_NODES = {0, 1}   # Các node luôn tồn tại kể cả khi không có camera

def find_camera_indices():
    """
    Quét /dev/video* và trả về danh sách index USB camera thực sự.
    Bỏ qua: ISP nodes (0,1), VIDC codec (32+).
    Chỉ trả về kết quả nếu có device mới xuất hiện ngoài baseline.
    """
    all_indices = set()
    for path in glob.glob('/dev/video*'):
        try:
            idx = int(path.replace('/dev/video', ''))
            if idx < 20:
                all_indices.add(idx)
        except ValueError:
            pass

    # Camera USB chỉ xuất hiện khi có device ngoài baseline
    camera_indices = sorted(all_indices - BOARD_BASELINE_NODES)
    return camera_indices


class CameraReader(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True, name="CameraThread")
        self.cap     = None
        self._frame  = None
        self.lock    = threading.Lock()
        self.running = True
        self.ready   = False

    def _try_index(self, index):
        """Thử mở camera tại index bằng số nguyên (tương thích mọi build OpenCV)."""
        configs = [
            # MJPG ưu tiên: camera nén sẵn trước khi gửi qua USB (~2-3MB/s vs YUYV ~27MB/s)
            # → giảm hẳn select() timeout do USB bandwidth saturation
            (cv2.VideoWriter_fourcc(*'MJPG'), CAMERA_WIDTH, CAMERA_HEIGHT, "MJPG 640x480"),
            (cv2.VideoWriter_fourcc(*'YUYV'), 320, 240, "YUYV 320x240"),
            (cv2.VideoWriter_fourcc(*'YUYV'), CAMERA_WIDTH, CAMERA_HEIGHT, "YUYV 640x480"),
        ]
        for fourcc, w, h, label in configs:
            cap = cv2.VideoCapture(index, cv2.CAP_V4L2)
            if not cap.isOpened():
                return None

            cap.set(cv2.CAP_PROP_FOURCC, fourcc)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, w)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, h)
            cap.set(cv2.CAP_PROP_FPS, 15)        # 15fps: giảm USB bandwidth 50%
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            print(f"  → Warm-up /dev/video{index} [{label}]...")
            time.sleep(1.5)
            for _ in range(15):
                cap.grab()

            for _ in range(10):
                ret, frame = cap.read()
                if ret and frame is not None and np.mean(frame) > 8:
                    print(f"✅ Camera OK: /dev/video{index} [{label}]")
                    return cap
                time.sleep(0.1)

            cap.release()
            print(f"  ✗ /dev/video{index} [{label}]: thất bại")
        return None

    def _open(self):
        """Quét động tất cả /dev/video* hiện có và thử từng cái."""
        indices = find_camera_indices()
        if not indices:
            # Không có camera USB nào — chỉ còn ISP baseline nodes
            return None
        print(f"  📷 Tìm thấy USB camera nodes: {[f'/dev/video{i}' for i in indices]}")
        for idx in indices:
            cap = self._try_index(idx)
            if cap is not None:
                return cap
        return None

    def run(self):
        retry_delay   = 3
        fail_streak   = 0          # Đếm số lần đọc frame thất bại LIÊN TIẼP
        MAX_FAILS     = 5          # Chỉ reset sau 5 lần thất bại liên tiếp

        while self.running:
            if self.cap is None:
                print("🔍 Quét camera USB...")
                self.cap = self._open()
                if self.cap is None:
                    print(f"⏳ Không tìm thấy camera USB, thử lại sau {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay = min(retry_delay * 2, 30)
                    continue
                retry_delay = 3
                fail_streak = 0
                self.ready  = True

            ret, frame = self.cap.read()

            if not ret or frame is None:
                fail_streak += 1
                if fail_streak < MAX_FAILS:
                    # Lỗi đơn lᮣ (select timeout thoáng qua) — thử lại ngay
                    print(f"⚠️  Frame lỗi [{fail_streak}/{MAX_FAILS}], thử lại...")
                    time.sleep(0.1)
                    continue
                # Thất bại {MAX_FAILS} lần liên tiếp → camera mất kết nối thật sự
                print(f"❌ Camera mất kết nối sau {MAX_FAILS} lần liên tiếp, reset và chờ USB...")
                self.cap.release()
                self.cap    = None
                self.ready  = False
                fail_streak = 0
                retry_delay = 3
                time.sleep(5)
                continue

            fail_streak = 0   # Reset khi đọc frame thành công
            with self.lock:
                self._frame = frame

    def get_frame(self):
        with self.lock:
            return self._frame.copy() if self._frame is not None else None

    def stop(self):
        self.running = False






# ─────────────────────────────────────────────
# 4. THREADED AI INFERENCE
# ─────────────────────────────────────────────
class InferenceWorker(threading.Thread):
    """Thread riêng cho AI: không bao giờ block luồng stream."""
    def __init__(self):
        super().__init__(daemon=True, name="InferenceThread")
        self._queue  = deque(maxlen=1)  # Chỉ giữ frame MỚI NHẤT để infer
        self.running = True
        self.event   = threading.Event()

    def submit(self, frame):
        """Đưa frame vào hàng đợi (ghi đè frame cũ nếu chưa xử lý xong)."""
        self._queue.append(frame)
        self.event.set()

    def run(self):
        while self.running:
            self.event.wait(timeout=2)
            self.event.clear()
            if not self._queue:
                continue

            frame = self._queue.pop()
            start_ms = time.time()
            _, img_bytes = cv2.imencode(".jpg", frame)

            try:
                r    = requests.post(MODEL_URL, data=img_bytes.tobytes(), timeout=3)
                data = r.json()

                if "predictions" in data and data["predictions"]:
                    best = max(data["predictions"], key=lambda x: x["probability"])
                    ms   = int((time.time() - start_ms) * 1000)
                    print(f"🍎 {best['tagName']} | {best['probability']:.0%} | {ms}ms")

                    # Chụp ảnh base64 gửi lên DB backend
                    _, snap_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    snap_b64 = base64.b64encode(snap_buf).decode('utf-8')

                    payload = {
                        "fruit_type"    : "APPLE",
                        "status"        : str(best["tagName"]).capitalize(),
                        "quality_score" : round(best["probability"] * 10, 1),
                        "confidence"    : round(best["probability"] * 100, 2),
                        "inference_ms"  : ms,
                        "snapshot_url"  : f"data:image/jpeg;base64,{snap_b64}"
                    }
                    try:
                        requests.post(BACKEND_API_URL, json=payload, timeout=2)
                    except Exception:
                        pass

            except requests.exceptions.RequestException as e:
                print("⚠️  AI/Backend lỗi:", e)
            except Exception as e:
                print("⚠️  Lỗi xử lý:", e)

    def stop(self):
        self.running = False
        self.event.set()


# ─────────────────────────────────────────────
# 4b. STREAM WORKER — emit socket KHÔNG BLOCK main loop
# ─────────────────────────────────────────────
class StreamWorker(threading.Thread):
    """
    Thread riêng để gọi sio.emit().
    Main loop chỉ cần gọi submit() và tiếp tục ngay — không bao giờ đợi emit.
    deque(maxlen=1): nếu frame trước chưa gửi xong, tự động bỏ và dùng frame mới nhất.
    """
    def __init__(self):
        super().__init__(daemon=True, name="StreamThread")
        self._queue  = deque(maxlen=1)
        self.running = True
        self.event   = threading.Event()

    def submit(self, b64_data):
        self._queue.append(b64_data)
        self.event.set()

    def run(self):
        while self.running:
            self.event.wait(timeout=1)
            self.event.clear()
            if not self._queue:
                continue
            if not sio.connected:
                self._queue.clear()  # Bỏ frame cũ khi chưa kết nối
                continue
            data = self._queue.pop()
            try:
                sio.emit('video_frame_upstream', data)
            except Exception:
                pass  # Lỗi emit không ảnh hưởng camera thread

    def stop(self):
        self.running = False
        self.event.set()


# ─────────────────────────────────────────────
# 5. KHỞI ĐỘNG
# ─────────────────────────────────────────────
cam       = CameraReader()
inferrer  = InferenceWorker()
streamer  = StreamWorker()
cam.start()
inferrer.start()
streamer.start()

print("⏳ Chờ camera khởi động (cắm USB nếu chưa có)...")
while not cam.ready:
    time.sleep(0.5)  # Chờ vô hạn — camera thread sẽ tự tìm khi USB cắm vào

print("🎥 Camera sẵn sàng! Bắt đầu stream...")

# ─────────────────────────────────────────────
# 6. VÒNG LẶP CHÍNH — CHỈ XỬ LÝ STREAM
# ─────────────────────────────────────────────
stream_interval    = 1.0 / STREAM_FPS   # ~66ms mỗi frame tại 15fps
last_stream_time   = 0
last_infer_time    = 0

# Pre-compile encode params
encode_params = [cv2.IMWRITE_JPEG_QUALITY, STREAM_QUALITY]

while True:
    now = time.time()

    # Giới hạn FPS: bỏ qua vòng lặp nếu chưa đến thời gian gửi frame tiếp theo
    if now - last_stream_time < stream_interval:
        # Sleep ngắn để không đốt CPU
        time.sleep(0.005)
        continue

    frame = cam.get_frame()
    if frame is None:
        time.sleep(0.05)
        continue

    last_stream_time = now

    # --- A. Stream WebSocket: scale nhỏ lại để giảm băng thông ---
    if STREAM_SCALE != 1.0:
        small = cv2.resize(frame, (0, 0), fx=STREAM_SCALE, fy=STREAM_SCALE,
                           interpolation=cv2.INTER_NEAREST)
    else:
        small = frame

    _, buffer = cv2.imencode('.jpg', small, encode_params)
    b64 = base64.b64encode(buffer).decode('utf-8')

    # submit() không bao giờ block — StreamWorker thread xử lý emit
    streamer.submit(f"data:image/jpeg;base64,{b64}")

    # --- B. Gửi frame sang InferenceWorker (không đợi kết quả) ---
    if now - last_infer_time > INFERENCE_INTERVAL:
        inferrer.submit(frame)  # Không block — thread khác sẽ xử lý
        last_infer_time = now