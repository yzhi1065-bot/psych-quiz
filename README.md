# 心理咨询刷题系统

心理咨询师考试刷题工具。Web 响应式 + 微信小程序双端支持。

## 访问地址（运行后）

| 服务 | 地址 | 说明 |
|------|------|------|
| H5 刷题端 | http://localhost:5175 | 考生练习入口 |
| 管理后台 | http://localhost:5173 | 管理员管理后台 |
| 后端 API | http://localhost:3000 | RESTful API |

## 测试账号

**手机号：** `13800000000` | **密码：** `admin123`

## 快速开始

### 首次运行（建议顺序）

```bash
# 1. 后端依赖 + 数据库
cd server
npm install
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts      # 填充测试数据
npx nest build

# 2. 前端依赖
cd ../client
npm install

cd ../admin
npm install
```

### 启动所有服务

```bash
# 三个终端分别启动，或使用启动脚本：

# 终端 1: 后端 API
cd server && node dist/src/main.js

# 终端 2: 管理后台
cd admin && npx vite --port 5173

# 终端 3: H5 刷题端
cd client && npx vite --port 5175
```

### Windows 启动脚本

```powershell
# 一键启动（需要管理员权限获取端口）
.\dev-start.ps1

# 停止所有服务
.\dev-stop.bat
```

## 项目结构

```
psych-quiz/
├── server/      # NestJS 后端 (TypeScript)
├── admin/       # 管理后台 (Vue3 + Element Plus + TypeScript)
├── client/      # H5 刷题端 (Vue3 + TypeScript)
├── deploy/      # Docker 部署配置
└── docs/        # 文档
```

## Docker 部署

```bash
cd deploy
docker-compose up -d
```

## 常见问题

### 端口 3000 被占用 / API 返回 404

检查是否有其他进程占用了 3000 端口。Windows 上某些服务（如 IIS、WSL、Docker）可能抢占端口。

```bash
# 查看谁在占用 3000
netstat -ano | findstr :3000

# 强制释放
.\dev-stop.bat
# 或手动 kill 对应 PID
```

### API 返回 `"username" Field required` 错误

这是端口被其他进程（通常是旧版本 Node/WSL 进程）拦截导致的。运行 `dev-stop.bat` 或手动 `taskkill` 释放端口后重启即可。

### 前端无法连接后端

确保后端在 3000 端口运行正常。前端通过 Vite proxy 转发 `/api` 请求到后端，无需单独配置跨域。

## 许可

本项目遵循 **自用许可协议**。

- ✅ **允许**：个人学习、研究、自用下载、非商业转载
- ❌ **禁止**：任何形式的商业化使用

完整条款见 [LICENSE](./LICENSE) 文件。
