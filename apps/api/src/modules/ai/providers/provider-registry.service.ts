import { Injectable } from "@nestjs/common";
import type { AiProvider, ProviderId } from "./provider.types";
import { OpenRouterProvider } from "./openrouter.provider";
import { A2eProvider } from "./a2e.provider";
import { MockProvider } from "./mock.provider";
import { ProviderConfigService } from "./provider-config.service";

/**
 * Provider Registry
 * - 注册所有 provider 实例
 * - 提供 listEnabled/get 等查询方法
 */
@Injectable()
export class ProviderRegistryService {
  private readonly providers: AiProvider[];

  constructor(
    openrouter: OpenRouterProvider,
    a2e: A2eProvider,
    mock: MockProvider
  ) {
    // mock 放最后；只有当 openrouter/a2e 都没配置时 mock.isEnabled() 才为 true
    this.providers = [openrouter, a2e, mock];
  }

  listEnabled(): AiProvider[] {
    return this.providers.filter((p) => p.isEnabled());
  }

  get(providerId: ProviderId): AiProvider | null {
    return this.providers.find((p) => p.id === providerId) ?? null;
  }
}

