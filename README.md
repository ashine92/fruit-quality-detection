Tên dự án
=========

Xây dựng hệ thống phân loại chất lượng trái cây ứng dụng Computer Vision và Edge AI

Tổng quan
---------
Dự án phát triển một hệ thống phân loại chất lượng trái cây theo thời gian thực cho môi trường nhà máy. Hệ thống kết hợp camera, mô hình Computer Vision (huấn luyện trên Azure Custom Vision), và thiết bị biên (HSPTEK Qualcomm AI BOX) để suy luận Edge AI và điều khiển cơ cấu gạt sản phẩm lỗi trên băng chuyền. Mục tiêu: tự động hoá kiểm tra chất lượng, giảm công sức thủ công, tăng độ chính xác và thông lượng.

Cấu trúc thư mục chính
----------------------
- [firmware](firmware): Do Ánh phụ trách — mã nhúng, driver, chương trình chạy trên thiết bị Qualcomm hoặc vi điều khiển, script tích hợp phần cứng.
- [ai](ai): Do Ánh phụ trách — mã và tài nguyên liên quan đến AI/Computer Vision (thu thập dữ liệu, tiền xử lý, pipeline huấn luyện, mô hình, export ONNX/TFLite, script inference trên Edge).
- [hardware](hardware): Do Thoa phụ trách — thiết kế cơ khí, sơ đồ mạch, bản vẽ CAD, sơ đồ kết nối phần cứng và tài liệu lắp ráp.
- [web-app](web-app): Do Hưng và Ngân phụ trách — ứng dụng hiển thị và quản lý hệ thống.
  - `frontend/`: Giao diện người dùng (ReactJS, HTML/CSS/JS) hiển thị video trực tiếp và dashboard
  - `backend/`: API (Node.js/Express hoặc tương tự) xử lý dữ liệu, lưu trữ kết quả và điều phối
  - `cloud/`: Thành phần cloud (database, endpoints, storage) nếu cần

Thành viên nhóm
---------------
1. Nguyễn Ngọc Hồng Ánh (N22DCCI001)
2. Nguyễn Thiện Hưng (N22DCCI019)
3. Phan Ngọc Ngân (N22DCCI026)
4. Võ Thị Kim Thoa (N22DCCI037)

Đề cương môn: IoT trong Nhà Máy
--------------------------------

Tên đề tài
: Xây dựng hệ thống phân loại chất lượng trái cây ứng dụng Computer Vision và Edge AI

CHƯƠNG 1: ĐẶT VẤN ĐỀ
- Trong nhà máy chế biến nông sản, kiểm tra chất lượng thường thủ công (KCS) dẫn tới:
  - Tốn nhiều nhân lực
  - Hiệu suất thấp với khối lượng lớn
  - Sai sót do mệt mỏi/đánh giá chủ quan
  - Khó đảm bảo đồng nhất
- Yêu cầu: Ứng dụng AI, Computer Vision và IoT để tự động hoá dây chuyền phân loại.
- Mục tiêu đề tài: Xây dựng hệ thống phân loại thời gian thực sử dụng camera, Azure Custom Vision và thiết bị Qualcomm để hỗ trợ kiểm tra chất lượng trong nhà máy.

CHƯƠNG 2: CƠ SỞ LÝ THUYẾT
2.1 Tổng quan về IoT trong nhà máy
- Khái niệm IIoT
- Vai trò IoT trong tự động hóa
- Xu hướng ứng dụng AI trong sản xuất thông minh

2.2 Tổng quan về Computer Vision và Edge AI
- Computer Vision: khái niệm và các bài toán (Image Classification, Object Detection, Image Segmentation)
- Edge AI: xử lý AI tại biên, ưu điểm (giảm độ trễ, giảm phụ thuộc Cloud, xử lý thời gian thực)

2.3 Mô hình học sâu cho phân loại ảnh
- AutoML trong Computer Vision
- Azure Custom Vision: giới thiệu và quy trình huấn luyện
- Các bước xuất mô hình cho Edge (ONNX/TFLite) và triển khai inference

CHƯƠNG 3: THIẾT KẾ HỆ THỐNG
3.1 Sơ đồ khối tổng quát
- Quy trình hoạt động:
  1) Trái cây di chuyển trên băng chuyền
  2) Cảm biến phát hiện vật thể
  3) Camera chụp hình sản phẩm
  4) Thiết bị Qualcomm xử lý ảnh và suy luận AI
  5) Qualcomm xuất tín hiệu điều khiển qua GPIO/Interface
  6) Servo gạt sản phẩm lỗi theo lệnh
  7) Dữ liệu và video được hiển thị trên Dashboard

3.2 Thiết kế phần cứng
- Khối xử lý trung tâm: HSPTEK Qualcomm AI BOX (hub tích hợp xử lý AI và điều khiển I/O)
- Camera: module phù hợp với FPS và độ phân giải yêu cầu
- Khối chấp hành: Servo Motor (kết nối trực tiếp hoặc qua driver)
- Driver điều khiển động cơ, cơ cấu gạt lắp trực tiếp vào động cơ
- Khối nguồn: nguồn cho Qualcomm và nguồn riêng cho động cơ/servo (cách ly nhiễu)
- Thiết kế mạch: sơ đồ nguyên lý và sơ đồ kết nối phần cứng

3.3 Thiết kế phần mềm
- Trên Qualcomm:
  - `Module AI`: lấy hình từ camera, tiền xử lý, chạy mô hình và phân loại
  - `Module Control`: quản lý logic điều khiển, đọc cảm biến, xuất PWM/signal cho servo
  - `Module Đồng bộ`: xử lý bù trễ theo vận tốc băng chuyền để đảm bảo gạt đúng vị trí
- Web Dashboard:
  - Backend: JavaScript (Node.js), API nhận kết quả và điều phối
  - Frontend: ReactJS hiển thị video trực tiếp, số lượng đạt/lỗi, trạng thái hệ thống

CHƯƠNG 4: THỰC NGHIỆM VÀ ĐÁNH GIÁ
4.1 Xây dựng mô hình thực nghiệm
- Thi công băng chuyền, lắp camera và cơ cấu gạt, kết nối phần cứng, triển khai hệ thống hoàn chỉnh

4.2 Kết quả huấn luyện mô hình AI
- Tập dữ liệu: số lượng ảnh, phương pháp gán nhãn, augmentation
- Đánh giá: Accuracy, Precision, Recall, F1-score, Confusion Matrix

4.3 Đánh giá hiệu năng hệ thống
- Hiệu năng AI: FPS xử lý, inference latency
- Tài nguyên sử dụng: CPU, RAM, (GPU nếu có)
- Hiệu năng cơ khí: tỉ lệ gạt chính xác, sai số thời gian phản hồi

4.4 Đánh giá hoạt động tổng thể
- Hoạt động trong điều kiện ánh sáng khác nhau
- Độ ổn định hệ thống
- Độ trễ hiển thị Dashboard
- So sánh với phương pháp kiểm tra thủ công

CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
5.1 Kết luận
- Tổng kết kết quả đạt được, đánh giá mức độ hoàn thành mục tiêu, nêu ưu điểm và hạn chế

5.2 Hướng phát triển
- Mở rộng tập dữ liệu
- Phân loại nhiều loại trái cây hơn
- Tích hợp nhiều camera
- Kết nối Cloud Database
- Tối ưu tốc độ xử lý AI
- Ứng dụng cho dây chuyền công nghiệp thực tế

Ghi chú triển khai
- Phân chia công việc theo thư mục như trên để dễ quản lý.
- Mỗi thư mục nên có README con hướng dẫn chi tiết: yêu cầu phần cứng, cách chạy nhanh (quickstart), và checklist triển khai.

Liên hệ
- Nhóm đồ án: Nguyễn Ngọc Hồng Ánh, Nguyễn Thiện Hưng, Phan Ngọc Ngân, Võ Thị Kim Thoa
