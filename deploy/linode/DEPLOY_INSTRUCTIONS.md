# 部署到 Linode 服务器

## 前提条件
- Linode 服务器 IP: `170.187.234.128`
- 域名: `clingai.live` (通过 Cloudflare 解析)
- TLS 证书已配置

## 快速部署步骤

### 1. 修复 SSH 连接（如果需要）
如果 SSH 超时，通过 Linode 控制台（LISH Console）登录：
```bash
systemctl restart sshd
```

### 2. 上传代码到服务器
```bash
# 从本地同步代码
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env*' \
  ./ root@170.187.234.128:/opt/polaris/
```

### 3. 在服务器上构建和部署
```bash
ssh root@170.187.234.128

# 进入部署目录
cd /opt/polaris/deploy/linode

# 安装 Docker（如果未安装）
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 创建 TLS 证书目录
mkdir -p ./tls

# 将证书放入 tls 目录
# cert.pem - Cloudflare Origin Certificate
# key.pem  - Cloudflare Private Key

# 构建 Docker 镜像
docker compose build --no-cache

# 启动服务
docker compose up -d

# 等待服务启动后运行数据库迁移
sleep 15
docker compose exec api npx prisma migrate deploy

# 查看服务状态
docker compose ps
docker compose logs -f
```

### 4. 配置 TLS 证书
如果还没有配置证书，需要将 Cloudflare Origin Certificate 放入 `./tls/` 目录：
```bash
# cert.pem - 证书内容
# key.pem  - 私钥内容
```

### 5. 验证部署
```bash
# 检查 API 健康状态
curl https://clingai.live/api/health

# 检查前端
curl https://clingai.live
```

## 服务管理命令

```bash
# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新部署
docker compose build --no-cache
docker compose up -d

# 数据库迁移
docker compose exec api npx prisma migrate deploy

# 进入 API 容器
docker compose exec api sh

# 进入数据库
docker compose exec postgres psql -U polaris -d polaris
```

## 环境变量配置

编辑 `.env` 文件或在 `docker-compose.yml` 中配置：

```bash
# AI Provider API Keys (可在管理后台配置)
OPENROUTER_API_KEY=sk-xxx
A2E_API_KEY=xxx

# JWT 密钥
JWT_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

## 故障排除

### SSH 连接超时
1. 登录 Linode Console (LISH)
2. 重启 SSH: `systemctl restart sshd`
3. 检查防火墙: `ufw status`

### Docker 构建失败
```bash
# 清理 Docker 缓存
docker system prune -af
docker compose build --no-cache
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 容器
docker compose logs postgres
docker compose exec postgres pg_isready
```
