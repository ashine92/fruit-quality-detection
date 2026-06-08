import cv2

def check_cameras():
    print("=== SCRIPT KIỂM TRA CAMERA INDEX (OPENCV) ===")
    print("Đang quét các index từ 0 đến 10...\n")
    
    working_indexes = []
    opened_but_no_frame = []

    for index in range(11):
        print(f"[*] Đang thử index {index} ...", end=" ", flush=True)
        
        # Nếu đang chạy trên QCS6490, index 2 và 3 thường là Venus hardware node.
        # Nếu script của bạn bị TREO (đứng im) ở index 2 hoặc 3, hãy bấm Ctrl+C
        # và comment lại đoạn quét index đó hoặc rút webcam ra cắm lại.
        
        cap = cv2.VideoCapture(index, cv2.CAP_V4L2)
        
        if cap.isOpened():
            ret, frame = cap.read()
            if ret and frame is not None:
                print("✅ HOẠT ĐỘNG (Đọc được hình)")
                working_indexes.append(index)
            else:
                print("⚠️ MỞ ĐƯỢC nhưng KHÔNG CÓ HÌNH")
                opened_but_no_frame.append(index)
            cap.release()
        else:
            print("❌ Không mở được")

    print("\n=== KẾT QUẢ ===")
    print(f"- Các index hoạt động hoàn hảo: {working_indexes}")
    print(f"- Các index nhận diện nhưng không xuất hình: {opened_but_no_frame}")
    print("===============")
    
    if not working_indexes:
        print("-> LỜI KHUYÊN: Linux chưa nhận camera của bạn. Hãy thử đổi cổng USB hoặc đổi Webcam khác.")

if __name__ == "__main__":
    check_cameras()
