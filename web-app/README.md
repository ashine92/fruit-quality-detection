# Fruit Quality Detection Web App

Dự án này là Web Dashboard cho hệ thống phân loại chất lượng trái cây, bao gồm Frontend (React) và Backend (Node.js) chạy đồng thời. Hệ thống hiện sử dụng **SQLite** và **WebSockets** để truyền hình ảnh thời gian thực.

## 🚀 Hướng Dẫn Khởi Động Hệ Thống

Để khởi động hệ thống quản lý chất lượng trái cây, thực hiện các bước sau:

### BƯỚC 1: Khởi động Server (Frontend + Backend)
Mở một cửa sổ Terminal/PowerShell tại thư mục `web-app` và chạy lệnh:
```bash
npm install   # (Chỉ cần chạy lần đầu để cài thư viện)
npm run dev
```
*(Đừng tắt cửa sổ này trong suốt quá trình hoạt động)*

---

### BƯỚC 2: Mở Web Dashboard (Màn hình quản lý)
Mở trình duyệt web (Chrome/Edge) và truy cập vào địa chỉ:
👉 **http://localhost:3000**

- Đây là giao diện chính hiển thị thống kê. 
- Khung **Live Vision Feed** lúc này sẽ tối đen và báo hiệu `NO STREAM` cho đến khi Camera AI (thiết bị Edge) kết nối vào.

---

### BƯỚC 3: Bật Thiết Bị Edge (Phần Cứng)
- Khởi động mạch nhúng (Qualcomm AI/Raspberry Pi) và chạy script nhận diện:
```bash
cd firmware
python realtime.py
```
- Ngay lập tức, hình ảnh từ Camera thực tế sẽ truyền lên giao diện Dashboard kèm theo các số liệu nhận diện thực.

---

## 🗄 Quản Lý Database (SQLite)
Hệ thống sử dụng SQLite (không cần cài đặt gì thêm). File Database nằm tại: `database/fruit_quality.db`.
Dữ liệu sẽ được tự động lưu trữ và tính toán theo thời gian thực mỗi khi Camera phân tích một sản phẩm chạy qua băng chuyền.
