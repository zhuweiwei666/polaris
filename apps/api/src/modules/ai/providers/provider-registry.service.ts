import { Injectable } from "@nestjs/common";
import type { AiProvider, ProviderId } from "./provider.types";
import { OpenRouterProvider } from "./openrouter.provider";
import { A2eProvider } from "./a2e.provider";

/**
 * Provider Registry
 * - 第一阶段：依赖注入固定 provider 列表 + env key 开关
 * - 第二阶段：把 provider 配置（key 来源、默认模型、限流、成本策略）迁移到 DB/Config Center
 */
@Injectable()
export class ProviderRegistryService {
  private readonly providers: AiProvider[];

  constructor(openrouter: OpenRouterProvider, a2e: A2eProvider) {
    this.providers = [openrouter, a2e];
  }

  listEnabled(): AiProvider[] {
    return this.providers.filter((p) => p.isEnabled());
  }

  get(providerId: ProviderId): AiProvider | null {
    return this.providers.find((p) => p.id === providerId) ?? null;
  }
}

