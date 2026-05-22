import cv2
import time
import requests
import base64
import socketio

# 1. CẤU HÌNH ĐỊA CHỈ
# Địa chỉ trỏ tới Local Azure Custom Vision Container
MODEL_URL = "http://localhost/image"

# Địa chỉ trỏ tới Backend Node.js
BACKEND_API_URL = "http://192.168.0.109:5000/api/v1/inferences"
BACKEND_SOCKET_URL = "http://192.168.0.109:5000"

# 2. KHỞI TẠO SOCKET.IO CLIENT
sio = socketio.Client()

try:
    sio.connect(BACKEND_SOCKET_URL)
    print("Đã kết nối tới WebSocket Backend!")
except Exception as e:
    print("Không thể kết nối tới Socket Backend:", e)


# 3. KHỞI TẠO CAMERA
cap = cv2.VideoCapture(2, cv2.CAP_V4L2)
cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
time.sleep(2)

if not cap.isOpened():
    print("Lỗi: Không thể mở camera")
    exit()

print("Camera OK")

last_inference_time = 0
inference_interval = 0.3

while True:
    ret, frame = cap.read()
    if not ret:
        print("lỗi đọc khung hinh từ camera")
        continue

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