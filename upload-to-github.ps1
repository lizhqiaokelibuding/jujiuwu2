# 上传项目到 GitHub
# 使用方法: 右键 -> 使用 PowerShell 运行

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "上传项目到 GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git
try {
    $null = Get-Command git -ErrorAction Stop
} catch {
    Write-Host "[错误] 未检测到 Git" -ForegroundColor Red
    Write-Host "请先安装: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 1. 初始化
if (-not (Test-Path .git)) {
    Write-Host "[1/5] 初始化 Git 仓库..." -ForegroundColor Green
    git init
} else {
    Write-Host "[1/5] 仓库已存在" -ForegroundColor Gray
}

# 2. 远程
Write-Host "[2/5] 配置远程仓库..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin https://github.com/lizhqiaokelibuding/-0522.git

# 3. 添加
Write-Host "[3/5] 添加文件..." -ForegroundColor Green
git add .

# 4. 提交
Write-Host "[4/5] 提交..." -ForegroundColor Green
git commit -m "添加卡牌图片并更新项目"

# 5. 推送
Write-Host "[5/5] 推送到 GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "完成! https://github.com/lizhqiaokelibuding/-0522" -ForegroundColor Green
Read-Host "按回车键退出"
