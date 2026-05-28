# Setup: Save QCS6490 Snapshots to Windows Web-App

Snapshots từ camera trên QCS6490 sẽ được save tự động vào thư mục Windows:
```
D:\Study\DH\IoT in Factory\project\web-app\backend\public\snapshots
```

## Prerequisites

- Windows machine với thư mục web-app
- QCS6490 với realtime.py
- Network connectivity giữa 2 máy
- Windows username + password (để access SMB)

## Setup Steps

### Step 1: Tạo SMB Share trên Windows (1 lần)

**Trên Windows máy chủ:**

1. Mở **Command Prompt as Administrator** (Ctrl+Shift+Enter)
2. Chạy script setup:
   ```bash
   cd "D:\Study\DH\IoT in Factory\project\firmware"
   SETUP_SMB_SHARE_WINDOWS.bat
   ```

3. Script sẽ:
   - ✅ Tạo thư mục: `D:\Study\DH\IoT in Factory\project\web-app\backend\public\snapshots`
   - ✅ Share qua SMB với tên: `snapshots`
   - ✅ Cấp full permission cho everyone
   - ✅ Hiển thị IP address của Windows

**Output example:**
```
[OK] Created directory: D:\Study\DH\IoT in Factory\project\web-app\backend\public\snapshots
[OK] SMB Share created successfully
Share name: snapshots
Path: D:\Study\DH\IoT in Factory\project\web-app\backend\public\snapshots

Your IP address:
   IPv4 Address. . . . . . . . . : 192.168.0.110
```

### Step 2: Mount Share trên QCS6490 (1 lần)

**Trên QCS6490 device:**

1. SSH vào QCS6490
2. Cài đặt CIFS utils (nếu chưa có):
   ```bash
   sudo apt-get update
   sudo apt-get install -y cifs-utils
   ```

3. Tạo mount point:
   ```bash
   sudo mkdir -p /mnt/web_snapshots
   ```

4. Mount Windows share (thay IP + username + password):
   ```bash
   sudo mount -t cifs \
       -o username=YOUR_WINDOWS_USERNAME,password=YOUR_WINDOWS_PASSWORD,uid=$(id -u),gid=$(id -g) \
       //192.168.0.110/snapshots \
       /mnt/web_snapshots
   ```

   **Example:** Nếu Windows user là `Admin` và password là `mypass123`, IP là `192.168.0.110`:
   ```bash
   sudo mount -t cifs \
       -o username=Admin,password=mypass123,uid=$(id -u),gid=$(id -g) \
       //192.168.0.110/snapshots \
       /mnt/web_snapshots
   ```

5. Verify mount:
   ```bash
   mount | grep web_snapshots
   ls -la /mnt/web_snapshots
   ```

### Step 3: Run realtime.py

```bash
python3 realtime.py
```

Snapshots sẽ được save vào:
- **QCS6490 (Linux):** `/mnt/web_snapshots/Good_95%_20260528_143022.jpg`
- **Windows:** `D:\Study\DH\IoT in Factory\project\web-app\backend\public\snapshots\Good_95%_20260528_143022.jpg`

### Step 4: (Optional) Persistent Mount

Để mount tự động khi QCS6490 restart:

1. SSH vào QCS6490
2. Tạo credentials file (thay username + password):
   ```bash
   sudo bash -c 'cat > /etc/samba/credentials << EOF
   username=YOUR_WINDOWS_USERNAME
   password=YOUR_WINDOWS_PASSWORD
   EOF'
   
   sudo chmod 600 /etc/samba/credentials
   ```

3. Thêm vào `/etc/fstab` (chạy `sudo nano /etc/fstab`):
   ```
   //192.168.0.110/snapshots  /mnt/web_snapshots  cifs  credentials=/etc/samba/credentials,uid=1000,gid=1000  0  0
   ```

4. Mount lại để verify:
   ```bash
   sudo umount /mnt/web_snapshots
   sudo mount -a
   ```

## Troubleshooting

### ❌ "Permission denied" khi mount

**Giải pháp:**
- Kiểm tra username/password có đúng không
- Kiểm tra SMB share tồn tại: `net share` trên Windows
- Kiểm tra network connectivity: `ping 192.168.0.110`

### ❌ "Mount point does not exist"

**Giải pháp:**
```bash
sudo mkdir -p /mnt/web_snapshots
```

### ❌ "Cannot write snapshots"

**Giải pháp:**
- Kiểm tra write permission: `touch /mnt/web_snapshots/test.txt`
- Kiểm tra Windows firewall - cho phép SMB (port 445)
- Kiểm tra share permissions trên Windows

### ❌ "Connection refused"

**Giải pháp:**
- Bật SMB trên Windows (không tắt)
- Kiểm tra Windows IP: `ipconfig | findstr IPv4`
- Kiểm tra firewall rule: Network discovery phải bật

## Verify Setup

**Trên QCS6490:**
```bash
# Check mount
mount | grep web_snapshots

# Try write
touch /mnt/web_snapshots/test.txt
ls -la /mnt/web_snapshots
```

**Trên Windows:**
```cmd
# Check share
net share

# Browse snapshots
dir "D:\Study\DH\IoT in Factory\project\web-app\backend\public\snapshots"
```

## Auto-remove old snapshots

Thêm cronjob trên QCS6490 để tự xóa ảnh cũ (optional):

```bash
# Xóa snapshots cũ hơn 7 ngày
crontab -e
# Thêm dòng:
0 2 * * * find /mnt/web_snapshots -type f -mtime +7 -delete
```

## Troubleshooting network issues

Nếu mount không work, debug với:

```bash
# Test connection
ping 192.168.0.110

# Test SMB connectivity
smbclient -L //192.168.0.110 -U YOUR_WINDOWS_USERNAME

# Verbose mount
sudo mount -t cifs -vvv -o username=...,password=... //192.168.0.110/snapshots /mnt/web_snapshots
```

---

**Setup xong!** 🎯 Mỗi khi AI classify được ảnh tốt, nó tự động save vào Windows:

```
QCS6490 camera → realtime.py → Custom Vision model → Snapshot save → Windows share
```

Snapshots sẽ hiển thị trong web-app frontend! 📸
