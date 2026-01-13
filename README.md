## 北极星大中台（Product Factory）- Monorepo

目标：用一套中台能力（账号/订阅/配额/AI 调用/任务/产物/消息/配置/观测/数据口径），快速拼装出大量 ToC App + Web 产品。

### 目录结构

- `apps/api`: NestJS 中台 API（模块化单体，后续可拆微服务）
- `apps/web`: Next.js Web（产品壳 + 可插拔 Feature Kits）
- `packages/contracts`: API 契约（OpenAPI）与事件/工具 schema（单一事实源）
- `packages/sdk`: 前端/移动端共用的 API SDK（fetch 封装、鉴权、错误码）
- `packages/ui`: Web UI 组件库（设计系统；移动端后续可做同名 kit）

### Day-0：本地启动（需要你本机可联网安装依赖）

1) 安装 pnpm（如已安装可跳过）：

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

2) 安装依赖：

```bash
pnpm install
```

3) 启动基础依赖（Postgres/Redis）：

```bash
docker compose up -d
```

4) 启动 API：

```bash
pnpm -C apps/api dev
```

5) 启动 Web：

```bash
pnpm -C apps/web dev
```

6) 配置环境变量：

- 复制 `env.example` 为 `.env`（或分别在 `apps/api`、`apps/web` 放各自的 `.env.local`）
- 重点填：`OPENROUTER_API_KEY` / `A2E_API_KEY`、以及后续的 `GCS_BUCKET`

### 部署（边更新边部署迭代）：GCP Cloud Run + GitHub Actions（默认推荐）

仓库已内置 workflow：`.github/workflows/deploy-gcp-cloudrun.yml`。你 push 到 `main` 会自动：

- build `apps/api` Docker 镜像并推送到 Artifact Registry
- build `apps/web`（Next standalone）镜像并推送
- 部署到 Cloud Run（`zhongtai-api`、`zhongtai-web`）

#### 你需要在 GCP 侧提前做的事情

- 创建 GCP Project
- 启用 API：Cloud Run、Artifact Registry
- 创建 Artifact Registry 仓库（例如 `zhongtai`）
- 创建 Service Account 并授予最小权限（Cloud Run Admin、Artifact Registry Writer 等）
- 生成 SA Key JSON（或改成 Workload Identity Federation）

#### 你需要在 GitHub Secrets 配置的变量

- `GCP_PROJECT_ID`
- `GCP_REGION`（例如 `asia-east1`）
- `GCP_ARTIFACT_REPO`（例如 `zhongtai`）
- `GCP_SA_KEY`（Service Account JSON）

> 其余敏感配置（`OPENROUTER_API_KEY` / `A2E_API_KEY` / `DATABASE_URL` / `REDIS_URL`）建议放到 **GCP Secret Manager**，workflow 会在部署时注入到 Cloud Run。

#### 还需要（为了 Terraform 自动建基础设施）

- `OPENROUTER_API_KEY`（用于 Terraform 写入 Secret Manager）
- `A2E_API_KEY`（可选）

你只需要在 GitHub Actions 里手动运行一次：`infra-apply`（它会创建 Cloud SQL / Redis / VPC connector / Secret Manager / runtime SA 等）。

> `NEXT_PUBLIC_API_BASE_URL` 不需要手动配置：workflow 会先部署 API，再自动读取 Cloud Run URL，作为 Web build-time 注入。

> 注意：目前 workflow 为了快速迭代，API 暂时 `--allow-unauthenticated`。等 Auth/鉴权接好后，再改为只允许受控访问（或放到 API Gateway 后面）。

### 路线二（推荐，零手工）：Terraform + GitHub Actions 一键创建 Cloud SQL/Redis/VPC/Secrets

为了实现“配置驱动 + 真异步队列”，我们用 `infra-apply` workflow 自动创建：

- Cloud SQL Postgres（实例名默认：`zhongtai-pg`，区域与 Cloud Run 一致）
- Memorystore Redis（私网 IP）
- Serverless VPC Access Connector（默认名：`zhongtai-conn`，用于 Cloud Run 访问私网 Redis）

> `deploy-gcp-cloudrun` workflow 已支持：自动挂载 Cloud SQL、自动使用 VPC connector、自动注入 Secret Manager secrets；你后续只要 push 代码即可持续部署。

#### 需要的 IAM 权限（给 `GCP_SA_KEY` 对应的 SA）

Terraform 创建资源需要较高权限。最省事方式：给这个 SA 绑定以下角色（项目级别）：

- `roles/serviceusage.serviceUsageAdmin`
- `roles/cloudsql.admin`
- `roles/redis.admin`
- `roles/vpcaccess.admin`
- `roles/secretmanager.admin`
- `roles/iam.serviceAccountAdmin`
- `roles/resourcemanager.projectIamAdmin`
- `roles/storage.admin`

如果你愿意最简单粗暴（不推荐长期）：临时给它 `roles/editor` 或 `roles/owner`，跑完 `infra-apply` 后再收紧权限。

### Prisma 迁移（DB 上线时）

- **本地开发**（docker-compose Postgres）：  
  在配置好 `DATABASE_URL` 后执行：

```bash
pnpm -C apps/api prisma:migrate:dev
```

- **生产环境**：  
  建议在发布流程中显式执行 `migrate deploy`（而不是每次服务启动自动迁移），避免多实例并发迁移风险：

```bash
pnpm -C apps/api prisma:migrate:deploy
```

> 早期你也可以先不配置 `DATABASE_URL`/`REDIS_URL`，Cloud Run 会以“无 DB/无队列”的模式运行，确保部署链路先跑通；等 Cloud SQL/Redis 准备好再打开。

### 中台模块（第一期）

- **Identity/Auth**: Google + Apple 登录、token 刷新、设备会话
- **Config/Policy**: 免费次数/入口开关/灰度策略（不写死）
- **Quota/Entitlement**: 次数账本（reserve/commit/release）+ 功能解锁开关
- **Tools Registry**: 工具注册表（schema 驱动前端表单）
- **AI Tasks**: 异步任务队列（文本/图/视频统一 artifacts[]）
- **Artifacts**: GCS 对象存储 + 短时 Signed URL（必须登录，不可分享）
- **Inbox**: 站内消息（system/billing/task）
- **Billing**: iOS/Android 校验入口（订阅状态机/权益发放）

### 配置驱动（写活）：Provider/Tool/Policy

API 已提供最小 admin 接口（需要配置 `DATABASE_URL` 才能启用）：

- `GET/POST /api/admin/providers`：管理 provider（openrouter/a2e/后续任意新服务方）
- `GET/POST /api/admin/providers/:id/models`：管理模型
- `GET/POST /api/admin/tools`：管理 tool（含 JSON schema + providerPolicy）

> 生产环境建议把 `admin/*` 收口到受保护的管理入口（Auth + RBAC），当前为了快速迭代先不加鉴权。

### 你接下来怎么“当天做产品”

1) 在 `packages/contracts` 新增/调整 `tool_id` 与参数 schema  
2) 在 `apps/api` 的 `ai` 模块新增 provider 适配/路由策略  
3) 在 `apps/web` 选用/新增一个 feature kit（页面与组件）  
4) 用 `config/policy` 灰度放量，埋点与成本/失败率看板跟上  

