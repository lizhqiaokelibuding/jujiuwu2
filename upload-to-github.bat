@echo off
chcp 65001 >nul
echo ========================================
echo 上传项目到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git，请先安装 Git for Windows
    echo 下载地址: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/5] 初始化 Git 仓库...
if not exist .git (
    git init
) else (
    echo 仓库已存在，跳过初始化
)

echo.
echo [2/5] 添加远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/lizhqiaokelibuding/-0522.git

echo.
echo [3/5] 添加所有文件...
git add .

echo.
echo [4/5] 提交更改...
git commit -m "添加卡牌图片并更新项目"

echo.
echo [5/5] 推送到 GitHub...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 上传成功！
    echo 项目地址: https://github.com/lizhqiaokelibuding/-0522
    echo ========================================
) else (
    echo.
    echo [提示] 推送失败时请检查：
    echo 1. 先在 GitHub 创建空仓库: https://github.com/new  ^(仓库名填 -0522^)
    echo 2. 登录 GitHub - 会弹出浏览器或要求输入用户名/密码
    echo 3. 仓库已有内容时，可执行: git pull origin main --allow-unrelated-histories
    echo    然后再执行: git push -u origin main
)

echo.
pause
