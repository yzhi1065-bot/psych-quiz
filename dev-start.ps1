# 心理咨询刷题系统 - 开发启动脚本
# 一键启动所有服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  心理刷题系统 - 开发模式启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path $MyInvocation.MyCommand.Path

# 1. 启动后端 API
Write-Host ">>> 启动后端 API..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
  Set-Location "$using:root\server"
  node dist/src/main.js
}
Start-Sleep -Seconds 3

# 2. 启动管理后台
Write-Host ">>> 启动管理后台 (http://localhost:5173)..." -ForegroundColor Yellow
$adminJob = Start-Job -ScriptBlock {
  Set-Location "$using:root\admin"
  npx vite --port 5173
}

# 3. 启动 H5 端
Write-Host ">>> 启动 H5 刷题端 (http://localhost:5175)..." -ForegroundColor Yellow
$clientJob = Start-Job -ScriptBlock {
  Set-Location "$using:root\client"
  npx vite --port 5175
}

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  所有服务已启动！" -ForegroundColor Green
Write-Host "  API:     http://localhost:3000" -ForegroundColor Green
Write-Host "  管理后台: http://localhost:5173" -ForegroundColor Green
Write-Host "  刷题端:   http://localhost:5175" -ForegroundColor Green
Write-Host "  测试账号: 13800000000 / admin123" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "按 Ctrl+C 停止所有服务" -ForegroundColor Gray

# 等待
try {
  while ($true) { Start-Sleep -Seconds 10 }
} finally {
  $serverJob | Stop-Job | Remove-Job
  $adminJob | Stop-Job | Remove-Job
  $clientJob | Stop-Job | Remove-Job
}
