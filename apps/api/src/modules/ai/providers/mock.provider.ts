import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiGenerateRequest, AiGenerateResult, AiProvider } from "./provider.types";
import { ProviderConfigService } from "./provider-config.service";

/**
 * Mock provider - 仅在没有任何真正 provider key 时启用
 * 用于演示/验收链路，不会真正调用任何 AI API
 */
@Injectable()
export class MockProvider implements AiProvider {
  readonly id = "mock";

  constructor(
    private readonly config: ConfigService,
    private readonly providerConfig: ProviderConfigService
  ) {}

  /**
   * 仅当 openrouter + a2e 都没配置时启用 Mock
   * 检查 env 或 DB 中是否有配置 key
   */
  isEnabled(): boolean {
    // 检查 env 变量
    const hasEnvKey =
      Boolean(this.config.get<string>("OPENROUTER_API_KEY")) ||
      Boolean(this.config.get<string>("A2E_API_KEY"));
    // 检查 DB 配置
    const hasDbKey =
      Boolean(this.providerConfig.getApiKey("openrouter")) ||
      Boolean(this.providerConfig.getApiKey("a2e"));
    return !hasEnvKey && !hasDbKey;
  }

  async generate(req: AiGenerateRequest): Promise<AiGenerateResult> {
    // 延迟模拟 provider 处理
    await new Promise((r) => setTimeout(r, 500));
    return {
      providerId: this.id,
      model: "mock-v1",
      artifacts: [
        {
          type: "text",
          content: `[MOCK] 这是一个演示结果。\n\n工具：${req.toolId}\n你的输入：${JSON.stringify(req.payload)}\n\n当你配置 OPENROUTER_API_KEY 或 A2E_API_KEY 后，这里将显示真正的 AI 生成内容。`
        }
      ]
    };
  }
}
