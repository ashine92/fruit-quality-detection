import cv2
import time
import requests

URL = "http://localhost/image"

# IMPORTANT: dùng index hoặc device
cap = cv2.VideoCapture(2, cv2.CAP_V4L2)

# ép MJPEG
cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

time.sleep(2)

if not cap.isOpened():
    print("Camera open failed")
    exit()

print("Camera OK")

last = 0
interval = 0.3

while True:
    ret, frame = cap.read()

    if not ret:
        print("Frame error")
        continue

    # inference throttle
    if time.time() - last > interval:
        _, img = cv2.imencode(".jpg", frame)

        try:
            r = requests.post(URL, data=img.tobytes(), timeout=2)
            data = r.json()

            best = max(data["predictions"], key=lambda x: x["probability"])
            print(best["tagName"], best["probability"])

        except Exception as e:
            print("infer error:", e)

        last = time.time()
