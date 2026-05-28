@echo off
REM Setup SMB Share trên Windows để QCS6490 có thể mount
REM Run this as Administrator on Windows machine

setlocal enabledelayedexpansion

REM ─────────────────────────────────────────────
REM 1. CHECK IF ADMIN
REM ─────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM ─────────────────────────────────────────────
REM 2. CREATE SNAPSHOTS DIRECTORY
REM ─────────────────────────────────────────────
set SNAPSHOTS_DIR=D:\Study\DH\IoT in Factory\project\web-app\backend\public\snapshots

if not exist "%SNAPSHOTS_DIR%" (
    mkdir "%SNAPSHOTS_DIR%"
    echo [OK] Created directory: %SNAPSHOTS_DIR%
) else (
    echo [OK] Directory already exists: %SNAPSHOTS_DIR%
)

REM ─────────────────────────────────────────────
REM 3. CREATE SMB SHARE
REM ─────────────────────────────────────────────
REM Tên share: snapshots
REM Allow everyone to read/write

net share snapshots="%SNAPSHOTS_DIR%" /grant:Everyone,full /remark:"IoT Snapshots from QCS6490" /cache:caching disabled

if %errorlevel% equ 0 (
    echo [OK] SMB Share created successfully
    echo Share name: snapshots
    echo Path: %SNAPSHOTS_DIR%
) else (
    echo [ERROR] Failed to create share
    pause
    exit /b 1
)

REM ─────────────────────────────────────────────
REM 4. VERIFY SHARE
REM ─────────────────────────────────────────────
echo.
echo Listing all shares:
net share

REM ─────────────────────────────────────────────
REM 5. GET WINDOWS IP
REM ─────────────────────────────────────────────
echo.
echo Your IP address:
ipconfig | findstr /I "IPv4"

echo.
echo ─────────────────────────────────────────────
echo SETUP COMPLETE!
echo ─────────────────────────────────────────────
echo.
echo On QCS6490, run:
echo   bash SETUP_SMB_MOUNT.sh
echo.
echo Then mount with:
echo   sudo mount -t cifs \
echo       -o username=[Windows User],password=[Windows Pass],uid=$(id -u),gid=$(id -g) \
echo       //[WINDOWS_IP]/snapshots \
echo       /mnt/web_snapshots
echo.
pause
