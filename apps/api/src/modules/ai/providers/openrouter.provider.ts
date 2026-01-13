import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiGenerateRequest, AiGenerateResult, AiProvider } from "./provider.types";

@Injectable()
export class OpenRouterProvider implements AiProvider {
  readonly id = "openrouter";

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.config.get<string>("OPENROUTER_API_KEY"));
  }

  async generate(req: AiGenerateRequest): Promise<AiGenerateResult> {
    // 这里先占位：后续接 OpenRouter chat/completions 或 image API
    // 注意：真实实现需要超时/重试/熔断/成本记录/内容安全等
    return {
      providerId: this.id,
      model: req.model ?? "TODO",
      artifacts: [
        {
          type: "text",
          content: `TODO(OpenRouter): toolId=${req.toolId}, modality=${req.modality}`
        }
      ]
    };
  }
}

