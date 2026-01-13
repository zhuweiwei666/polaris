import { Injectable, OnModuleInit } from "@nestjs/common";
import type { AiProvider, ProviderId } from "./provider.types";
import { OpenRouterProvider } from "./openrouter.provider";
import { A2eProvider } from "./a2e.provider";
import { MockProvider } from "./mock.provider";
import { PrismaService } from "../../db/prisma.service";

/**
 * Provider Registry
 * - 支持从 DB 读取 API key（运营后台配置）
 * - Fallback 到 env 变量
 */
@Injectable()
export class ProviderRegistryService implements OnModuleInit {
  private readonly providers: AiProvider[];
  private dbKeys: Map<string, string> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    openrouter: OpenRouterProvider,
    a2e: A2eProvider,
    mock: MockProvider
  ) {
    // mock 放最后；只有当 openrouter/a2e 都没配置时 mock.isEnabled() 才为 true
    this.providers = [openrouter, a2e, mock];
  }

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
   * 获取 provider 的 API key：优先 DB，fallback env
   */
  getApiKey(providerId: ProviderId): string | undefined {
    return this.dbKeys.get(providerId) || undefined;
  }

  listEnabled(): AiProvider[] {
    return this.providers.filter((p) => p.isEnabled());
  }

  get(providerId: ProviderId): AiProvider | null {
    return this.providers.find((p) => p.id === providerId) ?? null;
  }
}

