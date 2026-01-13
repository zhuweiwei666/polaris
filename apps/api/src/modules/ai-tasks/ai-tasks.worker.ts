import { Injectable } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import { AiTasksService } from "./ai-tasks.service";
import { ToolsService } from "../tools/tools.service";

@Injectable()
export class AiTasksWorkerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiTasksService,
    private readonly tools: ToolsService
  ) {}

  async handle(taskId: string) {
    if (!this.prisma.enabled) {
      // 无 DB 就没法做异步持久化（早期可让 API 退化为同步执行）
      return;
    }

    const task = await this.prisma.aiTask.findUnique({ where: { id: taskId } });
    if (!task) return;
    if (task.status === "canceled") return;

    await this.prisma.aiTask.update({ where: { id: taskId }, data: { status: "running" } });

    try {
      const tool = await this.tools.get(task.toolId);
      const providerPolicy = tool?.providerPolicy as any;

      const result = await this.ai.runOnce(
        {
          toolId: task.toolId,
          modality: ((tool?.modalityOut?.[0] as any) ?? "text") as any,
          payload: task.payload as any
        },
        providerPolicy
      );

      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: "succeeded",
          providerId: result.providerId,
          modelId: result.model
        }
      });

      for (const art of result.artifacts) {
        await this.prisma.aiArtifact.create({
          data: {
            id: `art_${Math.random().toString(16).slice(2)}`,
            taskId,
            type: art.type,
            objectKey: art.tempUrl ?? "TODO:gcs_object_key",
            metadata: { content: art.content, ...art.metadata }
          }
        });
      }
    } catch (e: any) {
      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: "failed",
          error: { message: String(e?.message ?? e), code: "task_failed" }
        }
      });
    }
  }
}

