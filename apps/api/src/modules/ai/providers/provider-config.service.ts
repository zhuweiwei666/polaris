import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../db/prisma.service";

/**
 * Provider Config Service
 * 只负责从 DB 加载 provider 的 apiKey，不依赖其他 provider
 * 解决循环依赖问题
 */
@Injectable()
export class ProviderConfigService implements OnModuleInit {
  private dbKeys: Map<string, string> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.reloadDbKeys();
  }

  /**
   * 从 DB 加载 provider 的 apiKey 到内存缓存
   */
  async reloadDbKeys() {
    if (!this.prisma.enabled) return;
    try {
      const providers = await this.prisma.provider.findMany({
        where: { enabled: true },
        select: { id: true, apiKey: true }
      });
      this.dbKeys.clear();
      for (const p of providers) {
        if (p.apiKey) {
          this.dbKeys.set(p.id, p.apiKey);
        }
      }
    } catch {
      // DB 查询失败不阻塞启动
    }
  }

  /**
   * 获取 provider 的 API key（仅从 DB）
   */
  getApiKey(providerId: string): string | undefined {
    return this.dbKeys.get(providerId);
  }
}
