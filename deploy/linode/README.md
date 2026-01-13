## Linode 一键部署（SSH）

目标：在一台 Ubuntu Linode 上用 Docker Compose 跑起来：

- Nginx (80) 反代
- Web (Next.js) -> `/`
- API (Nest) -> `/api/*`

### 访问方式

- Web: `http://<server-ip>/`
- 验收面板: `http://<server-ip>/status`
- API 健康检查: `http://<server-ip>/api/health`

### 配置（可选）

复制 `deploy/linode/env.example` 为 `deploy/linode/.env`，填入：

- `DATABASE_URL` / `REDIS_URL`（不填也能先跑通验收）
- `OPENROUTER_API_KEY` / `A2E_API_KEY`

### 启动

在服务器目录执行：

```bash
cd /opt/polaris/deploy/linode
docker compose up -d --build
```

