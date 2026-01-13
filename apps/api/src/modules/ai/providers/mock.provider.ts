import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiGenerateRequest, AiGenerateResult, AiProvider } from "./provider.types";
import { OpenRouterProvider } from "./openrouter.provider";
import { A2eProvider } from "./a2e.provider";

/**
 * Mock provider - 仅在没有任何真正 provider key 时启用
 * 用于演示/验收链路，不会真正调用任何 AI API
 */
@Injectable()
export class MockProvider implements AiProvider {
  readonly id = "mock";

  constructor(
    private readonly config: ConfigService,
    private readonly openrouter: OpenRouterProvider,
    private readonly a2e: A2eProvider
  ) {}

  /**
   * 仅当 openrouter + a2e 都没配置时启用 Mock
   */
  isEnabled(): boolean {
    return !this.openrouter.isEnabled() && !this.a2e.isEnabled();
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
