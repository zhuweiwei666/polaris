import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiGenerateRequest, AiGenerateResult, AiProvider } from "./provider.types";
import { ProviderConfigService } from "./provider-config.service";

@Injectable()
export class OpenRouterProvider implements AiProvider {
  readonly id = "openrouter";

  constructor(
    private readonly config: ConfigService,
    private readonly providerConfig: ProviderConfigService
  ) {}

  private getApiKey(): string | undefined {
    // 优先 DB 配置，fallback env
    return this.providerConfig.getApiKey(this.id) || this.config.get<string>("OPENROUTER_API_KEY");
  }

  isEnabled(): boolean {
    return Boolean(this.getApiKey());
  }

  async generate(req: AiGenerateRequest): Promise<AiGenerateResult> {
    const apiKey = this.getApiKey();
    // TODO: 真实调用 OpenRouter API
    // 这里先占位：后续接 OpenRouter chat/completions 或 image API
    return {
      providerId: this.id,
      model: req.model ?? "gpt-4o-mini",
      artifacts: [
        {
          type: "text",
          content: `[OpenRouter] 已配置 API Key (${apiKey?.slice(0, 8)}...)。\n\n工具：${req.toolId}\n输入：${JSON.stringify(req.payload)}\n\n（真实 API 调用待实现）`
        }
      ]
    };
  }
}

