import { Injectable } from "@nestjs/common";
import { AiRouterService } from "../ai/ai-router.service";
import type { AiGenerateRequest } from "../ai/providers/provider.types";

@Injectable()
export class AiTasksService {
  constructor(private readonly router: AiRouterService) {}

  /**
   * 第一阶段：只做“路由选择 + provider 调用占位”
   * 第二阶段：接入队列（BullMQ）、配额账本、产物入库（GCS）、失败重试与成本记录
   */
  async runOnce(req: AiGenerateRequest, providerPolicy?: { providers?: string[]; models?: string[] }) {
    const { provider, model } = this.router.pick(req, providerPolicy);
    return provider.generate({ ...req, model });
  }
}

