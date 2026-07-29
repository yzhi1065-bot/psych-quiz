# 心理咨询刷题系统

心理咨询师考试刷题工具。Web 响应式 + 微信小程序双端支持。

## 快速开始

```bash
# 1. 安装依赖
cd server && npm install
cd ../admin && npm install
cd ../client && npm install

# 2. 初始化数据库
cd ../server
npx prisma migrate dev
npx prisma db seed

# 3. 编译后端
npm run build

# 4. 启动所有服务（三个终端）
# 终端 1: 后端 API
node dist/src/main.js

# 终端 2: 管理后台
cd ../admin && npx vite --port 5173

# 终端 3: H5 刷题端
cd ../client && npx vite --port 5175
```

## 访问地址

| 服务 | 地址 |
|------|------|
| 后端 API | http://localhost:3000 |
| 管理后台 | http://localhost:5173 |
| H5 刷题端 | http://localhost:5175 |

## 测试账号

手机号: `13800000000` | 密码: `admin123`

## 项目结构

```
psych-quiz/
├── server/      # NestJS 后端
├── admin/       # 管理后台 (Vue3 + Element Plus)
├── client/      # H5 刷题端 (Vue3)
├── deploy/      # Docker 部署配置
└── docs/        # 文档
```

## Docker 部署

```bash
cd deploy
docker-compose up -d
```

## 许可

本项目遵循 **自用许可协议**。

- ✅ **允许**：个人学习、研究、自用下载、非商业转载
- ❌ **禁止**：任何形式的商业化使用

完整条款见 [LICENSE](./LICENSE) 文件。
