#!/bin/bash
# Setup SMB mount từ QCS6490 sang Windows web-app
# Run this on the QCS6490 device once to mount the Windows share

# ─────────────────────────────────────────────
# 1. INSTALL CIFS UTILITIES (nếu chưa có)
# ─────────────────────────────────────────────
# apt-get update
# apt-get install -y cifs-utils

# ─────────────────────────────────────────────
# 2. CREATE MOUNT POINT
# ─────────────────────────────────────────────
sudo mkdir -p /mnt/web_snapshots

# ─────────────────────────────────────────────
# 3. MOUNT WINDOWS SHARE
# ─────────────────────────────────────────────
# Replace:
#   <WINDOWS_IP>     = IP của máy Windows (e.g., 192.168.0.110)
#   <USERNAME>       = Windows username (e.g., admin)
#   <PASSWORD>       = Windows password
#   <SHARE_PATH>     = Path share trên Windows (e.g., web-app-snapshots)

sudo mount -t cifs \
    -o username=<USERNAME>,password=<PASSWORD>,uid=$(id -u),gid=$(id -g) \
    //<WINDOWS_IP>/<SHARE_PATH> \
    /mnt/web_snapshots

# ─────────────────────────────────────────────
# 4. VERIFY MOUNT
# ─────────────────────────────────────────────
mount | grep web_snapshots
ls -la /mnt/web_snapshots

# ─────────────────────────────────────────────
# EXAMPLE: Mount từ 192.168.0.110 với share "snapshots"
# ─────────────────────────────────────────────
# sudo mount -t cifs \
#     -o username=Admin,password=mypass123,uid=$(id -u),gid=$(id -g) \
#     //192.168.0.110/snapshots \
#     /mnt/web_snapshots

# ─────────────────────────────────────────────
# OPTIONAL: Unmount
# ─────────────────────────────────────────────
# sudo umount /mnt/web_snapshots

# ─────────────────────────────────────────────
# PERSISTENT MOUNT (tự động mount khi restart)
# ─────────────────────────────────────────────
# Thêm vào /etc/fstab:
# //<WINDOWS_IP>/<SHARE_PATH>  /mnt/web_snapshots  cifs  username=<USERNAME>,password=<PASSWORD>,uid=$(id -u),gid=$(id -g)  0  0
