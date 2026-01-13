FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /repo

# ---- deps ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/sdk/package.json ./packages/sdk/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/modules/package.json ./packages/modules/package.json
RUN pnpm install --no-frozen-lockfile

# ---- build ----
FROM deps AS build
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY apps/web ./apps/web
COPY packages ./packages
WORKDIR /repo/apps/web
RUN pnpm build

# ---- runtime ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Next standalone runtime:
# .next/standalone already contains node_modules and server.js under apps/web
COPY --from=build /repo/apps/web/.next/standalone ./
# Static assets & public MUST go into apps/web sub-path (server.js runs from there).
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY apps/web/start.sh ./start.sh
RUN chmod +x /app/start.sh

# Cloud Run provides PORT
ENV PORT=8080
EXPOSE 8080

CMD ["/app/start.sh"]
