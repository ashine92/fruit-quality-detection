# Fruit Quality Detection Web App

Dự án này là Web Dashboard cho hệ thống phân loại chất lượng trái cây, bao gồm Frontend (React) và Backend (Node.js) chạy đồng thời. Hệ thống hiện sử dụng **SQLite** và **WebSockets** để truyền hình ảnh thời gian thực.

## 🚀 Hướng Dẫn Chạy Demo Toàn Bộ Hệ Thống Khi Chưa Có Phần Cứng Thực Tế

Để demo hệ thống cho giáo viên hoặc team, hãy làm theo đúng thứ tự 4 bước sau:

### BƯỚC 1: Khởi động Server (Frontend + Backend)
Mở một cửa sổ Terminal/PowerShell tại thư mục `web-app` và chạy lệnh:
```bash
npm install   # (Chỉ cần chạy lần đầu để cài thư viện)
npm run dev
```
*(Đừng tắt cửa sổ này trong suốt quá trình demo)*

---

### BƯỚC 2: Mở Web Dashboard (Màn hình quản lý)
Mở trình duyệt web (Chrome/Edge) và truy cập vào địa chỉ:
👉 **http://localhost:3000**

- Đây là giao diện chính hiển thị thống kê. 
- Khung **Live Vision Feed** lúc này sẽ tối đen và báo hiệu `NO STREAM` vì chưa có thiết bị Camera gửi dữ liệu lên.

---

### BƯỚC 3: Bật Camera giả lập Edge (Qualcomm AI)
Mở thêm **một tab mới** trên trình duyệt và truy cập vào địa chỉ:
👉 **http://localhost:3000/mock-edge.html**

- Trình duyệt sẽ hỏi quyền dùng Webcam/Camera của laptop, hãy bấm **Cho phép (Allow)**.
- Khi thấy chữ **CONNECTED TO BACKEND** màu xanh hiện lên, có nghĩa là Camera laptop đang liên tục chụp ảnh và stream gửi lên Server qua WebSockets (giống hệt cách con chip Qualcomm sẽ làm).

---

### BƯỚC 4: Xem kết quả Live Stream
Bây giờ, hãy chuyển về tab **Web Dashboard (localhost:3000)** ban đầu:
- Khung Live Vision Feed đã sáng lên, nhấp nháy chữ **LIVE** màu đỏ.
- Nó đang truyền hình ảnh trực tiếp (Live Stream) từ camera laptop của bạn với độ trễ cực thấp.
- **Để test dữ liệu phân loại:** Mở một cửa sổ PowerShell mới và chạy lệnh sau để giả lập 1 trái chuối bị thối đi qua băng chuyền:
  ```powershell
  $body = @{ fruit_type="Banana"; status="Rotten"; quality_score=0.10; confidence=97.5; inference_ms=11 } | ConvertTo-Json; Invoke-RestMethod -Method POST -Uri http://localhost:5000/api/v1/inferences -Body $body -ContentType "application/json"
  ```
  Nhìn vào Dashboard, số liệu và khung Current Detection sẽ tự động "nhảy" ngay lập tức!

---

## 🗄 Quản Lý Database (SQLite)
Hệ thống sử dụng SQLite (không cần cài đặt gì thêm). File Database nằm tại: `database/fruit_quality.db`.

Nếu muốn **xóa toàn bộ dữ liệu cũ và tạo lại 100 bản ghi mẫu mới**, bạn chỉ cần mở Terminal mới ở thư mục `web-app` và chạy:
```bash
node database/seed.js
```
