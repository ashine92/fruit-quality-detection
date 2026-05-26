import cv2
import time
import requests
import base64
import socketio

# 1. CẤU HÌNH ĐỊA CHỈ
# Địa chỉ trỏ tới Local Azure Custom Vision Container
MODEL_URL = "http://localhost/image"

# Địa chỉ trỏ tới Backend Node.js
BACKEND_API_URL = "http://192.168.0.106:5000/api/v1/inferences"
BACKEND_SOCKET_URL = "http://192.168.0.106:5000"

# 2. KHỞI TẠO SOCKET.IO CLIENT
sio = socketio.Client()

try:
    sio.connect(BACKEND_SOCKET_URL)
    print("Đã kết nối tới WebSocket Backend!")
except Exception as e:
    print("Không thể kết nối tới Socket Backend:", e)


# 3. KHỞI TẠO CAMERA VÀ TỰ ĐỘNG KẾT NỐI LẠI
def init_camera():
    # Quét qua các index từ 0 đến 10 để tìm camera đang sống
    for i in range(10):
        cap_temp = cv2.VideoCapture(i, cv2.CAP_V4L2)
        if cap_temp.isOpened():
            cap_temp.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
            cap_temp.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap_temp.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            ret_temp, _ = cap_temp.read()
            if ret_temp:
                print(f"Đã tìm thấy và kết nối Camera tại: /dev/video{i}")
                return cap_temp
            cap_temp.release()
    return None

cap = init_camera()
if cap is None:
    print("Lỗi: Không thể mở camera ở bất kỳ index nào")
    # Tạm thời exit, hoặc có thể sleep rồi quét lại
    exit()

print("Camera OK")

last_inference_time = 0
inference_interval = 0.3
fail_count = 0

while True:
    if cap is None:
        time.sleep(2)
        cap = init_camera()
        continue

    ret, frame = cap.read()
    if not ret:
        fail_count += 1
        print(f"Lỗi đọc khung hình từ camera (lần {fail_count})...")
        if fail_count > 10:
            print("⚠️ Cảnh báo: Camera có thể đã bị rớt phần cứng. Đang thử kết nối lại...")
            cap.release()
            cap = None
            fail_count = 0
        continue

    fail_count = 0

    # --- A. Luồng gửi Video qua WebSocket ---
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
    base64_frame = base64.b64encode(buffer).decode('utf-8')
    
    if sio.connected:
        try:
             sio.emit('video_frame_upstream', f"data:image/jpeg;base64,{base64_frame}")
        except Exception as e:
             pass 

    # --- B. Luồng Nhận diện AI và Đẩy API ---
    if time.time() - last_inference_time > inference_interval:
        start_ms = time.time()
        
        _, img_to_infer = cv2.imencode(".jpg", frame)

        try:
            r = requests.post(MODEL_URL, data=img_to_infer.tobytes(), timeout=2)
            data = r.json()

            if "predictions" in data and len(data["predictions"]) > 0:
                best = max(data["predictions"], key=lambda x: x["probability"])
                
                inference_ms = int((time.time() - start_ms) * 1000)
                print(f"Nhận diện: {best['tagName']} | Conf: {best['probability']:.2f} | Time: {inference_ms}ms")

                payload = {
                    "fruit_type": "APPLE",
                    "status": str(best["tagName"]).capitalize(),
                    "quality_score": round(best["probability"] * 10, 1),
                    "confidence": round(best["probability"] * 100, 2),
                    "inference_ms": inference_ms,
                    "snapshot_url": ""
                }
                
                requests.post(BACKEND_API_URL, json=payload, timeout=2)
            
        except requests.exceptions.RequestException as req_e:
             print("Lỗi kết nối tới AI Container hoặc Node Backend:", req_e)
        except Exception as e:
             print("Lỗi xử lý Data:", e)

        last_inference_time = time.time()