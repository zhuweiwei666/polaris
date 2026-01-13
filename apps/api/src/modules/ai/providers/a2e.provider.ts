import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiGenerateRequest, AiGenerateResult, AiProvider } from "./provider.types";

@Injectable()
export class A2eProvider implements AiProvider {
  readonly id = "a2e";

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.config.get<string>("A2E_API_KEY"));
  }

  async generate(req: AiGenerateRequest): Promise<AiGenerateResult> {
    return {
      providerId: this.id,
      model: req.model ?? "TODO",
      artifacts: [
        {
          type: "text",
          content: `TODO(A2E): toolId=${req.toolId}, modality=${req.modality}`
        }
      ]
    };
  }
}

