FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /repo

# ---- deps ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/sdk/package.json ./packages/sdk/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/ui/package.json ./packages/ui/package.json

# No lockfile yet; once you have pnpm-lock.yaml committed, switch to --frozen-lockfile
RUN pnpm install --no-frozen-lockfile

# ---- build ----
FROM deps AS build
COPY apps/api ./apps/api
COPY packages ./packages
WORKDIR /repo/apps/api
RUN pnpm prisma:generate
RUN pnpm build

# ---- runtime ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo

# Keep monorepo layout to preserve pnpm symlink structure:
# - /repo/node_modules/.pnpm store
# - /repo/apps/api/node_modules links into the store
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY apps/api/package.json ./apps/api/package.json

# Cloud Run provides PORT
ENV PORT=8080
EXPOSE 8080

# Nest build outputs dist/main.js
CMD ["node", "apps/api/dist/main.js"]

