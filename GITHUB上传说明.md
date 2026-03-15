# 上传到 GitHub 说明

目标仓库: https://github.com/lizhqiaokelibuding/-0522

---

## 方法一：使用 Git 命令行（推荐）

### 1. 安装 Git（如未安装）
- 下载: https://git-scm.com/download/win
- 安装时保持默认选项即可

### 2. 在 GitHub 创建仓库（如未创建）
- 打开 https://github.com/new
- 仓库名填写: `-0522`
- 选择 Public，**不要**勾选 "Add a README file"
- 点击 Create repository

### 3. 在本项目文件夹打开终端，执行：

```bash
# 进入项目目录
cd "c:\Users\Lwj14\Downloads\-0522-main (1)\-0522-main"

# 初始化
git init

# 添加远程
git remote add origin https://github.com/lizhqiaokelibuding/-0522.git

# 添加所有文件
git add .

# 提交
git commit -m "添加卡牌图片并更新项目"

# 推送
git branch -M main
git push -u origin main
```

### 4. 登录
首次推送会提示登录 GitHub，可选择：
- 浏览器登录
- 或使用 Personal Access Token 作为密码

---

## 方法二：使用 GitHub Desktop

1. 安装 GitHub Desktop: https://desktop.github.com/
2. 打开 GitHub Desktop -> File -> Add Local Repository
3. 选择本项目文件夹（若提示不是仓库，选 "create a repository"）
4. 点击 "Publish repository"，选择你的 GitHub 账号
5. 仓库名填 `-0522`，点击 Publish

---

## 方法三：使用 PowerShell 脚本

1. 确保已安装 Git
2. 在本项目文件夹中，右键 `upload-to-github.ps1`
3. 选择 "使用 PowerShell 运行"
4. 若提示无法运行脚本，先执行: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
