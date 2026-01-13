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
    this._enabled = true;
    await this.$connect();
  }

  async onModuleDestroy() {
    if (!this._enabled) return;
    await this.$disconnect();
  }
}

