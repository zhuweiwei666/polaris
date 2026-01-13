import { Injectable } from "@nestjs/common";
import type { AiGenerateRequest, AiProvider } from "./providers/provider.types";
import { ProviderRegistryService } from "./providers/provider-registry.service";

export type ProviderPolicy = {
  /**
   * 允许的 provider（按优先级）
   * - 不配置：走系统默认（enabled list）
   */
  providers?: string[];
  /**
   * 允许的模型（可选）
   */
  models?: string[];
};

@Injectable()
export class AiRouterService {
  constructor(private readonly registry: ProviderRegistryService) {}

  /**
   * 选择 provider/model 的核心入口
   * - 第一阶段：按 tool 的 providerPolicy 选第一个可用 provider
   * - 第二阶段：加成本/可用性/失败率/用户套餐/灰度等多维路由
   */
  pick(req: AiGenerateRequest, policy?: ProviderPolicy): { provider: AiProvider; model?: string } {
    const enabled = this.registry.listEnabled();
    if (enabled.length === 0) {
      throw new Error("No AI provider enabled. Configure OPENROUTER_API_KEY/A2E_API_KEY, etc.");
    }

    const preferred = policy?.providers?.length ? policy.providers : enabled.map((p) => p.id);
    const provider = preferred.map((id) => this.registry.get(id)).find((p): p is AiProvider => Boolean(p?.isEnabled()));
    if (!provider) {
      throw new Error(`No preferred provider available. preferred=${preferred.join(",")}`);
    }

    const model = policy?.models?.[0] ?? req.model;
    return { provider, model };
  }
}

