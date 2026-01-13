FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
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

# Prisma runtime needs OpenSSL; ensure runtime image has it so engine target matches generated client.
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Keep monorepo layout to preserve pnpm symlink structure:
# - /repo/node_modules/.pnpm store
# - /repo/apps/api/node_modules links into the store
# IMPORTANT: Prisma Client is generated during the build stage and lives inside node_modules.
# Copy from `build` (not `deps`) so the generated client is present at runtime.
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY apps/api/package.json ./apps/api/package.json
# Copy prisma schema for migrations
COPY apps/api/prisma ./apps/api/prisma

# Cloud Run provides PORT
ENV PORT=8080
EXPOSE 8080

# Nest build outputs dist/main.js
CMD ["node", "apps/api/dist/main.js"]

