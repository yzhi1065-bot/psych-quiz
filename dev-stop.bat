@echo off
echo ========================================
echo   心理刷题系统 - 停止所有服务
echo ========================================
echo.

echo 正在停止 Node.js 进程...
taskkill /F /IM node.exe 2>nul

echo 正在释放端口 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul

echo.
echo 所有服务已停止。
pause
