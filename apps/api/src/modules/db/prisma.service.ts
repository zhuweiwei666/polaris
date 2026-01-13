import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private _enabled = false;

  get enabled() {
    return this._enabled;
  }

  async onModuleInit() {
    // 允许 API 在未配置数据库时也能启动（用于早期 Cloud Run/本地快速迭代）
    if (!process.env.DATABASE_URL) {
      return;
    }
    // Cloud Run 启动阶段必须尽快开始监听端口；DB 连接失败/超时不应阻塞启动。
    const timeoutMs = Number(process.env.PRISMA_CONNECT_TIMEOUT_MS ?? 5000);
    try {
      await Promise.race([
        this.$connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Prisma connect timeout")), timeoutMs))
      ]);
      this._enabled = true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[db] prisma connect skipped (non-blocking):", err);
      this._enabled = false;
    }
  }

  async onModuleDestroy() {
    if (!this._enabled) return;
    await this.$disconnect();
  }
}

