import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiGenerateRequest, AiGenerateResult, AiProvider } from "./provider.types";
import { ProviderConfigService } from "./provider-config.service";

@Injectable()
export class A2eProvider implements AiProvider {
  readonly id = "a2e";

  constructor(
    private readonly config: ConfigService,
    private readonly providerConfig: ProviderConfigService
  ) {}

  private getApiKey(): string | undefined {
    return this.providerConfig.getApiKey(this.id) || this.config.get<string>("A2E_API_KEY");
  }

  isEnabled(): boolean {
    return Boolean(this.getApiKey());
  }

  async generate(req: AiGenerateRequest): Promise<AiGenerateResult> {
    const apiKey = this.getApiKey();
    return {
      providerId: this.id,
      model: req.model ?? "a2e-default",
      artifacts: [
        {
          type: "text",
          content: `[A2E] 已配置 API Key (${apiKey?.slice(0, 8)}...)。\n\n工具：${req.toolId}\n输入：${JSON.stringify(req.payload)}\n\n（真实 API 调用待实现）`
        }
      ]
    };
  }
}

