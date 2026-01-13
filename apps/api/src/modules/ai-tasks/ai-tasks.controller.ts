import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AiTasksService } from "./ai-tasks.service";
import { AiTaskQueueService } from "./ai-task-queue.service";
import { PrismaService } from "../db/prisma.service";
import { ToolsService } from "../tools/tools.service";
import { Prisma } from "@prisma/client";

type CreateTaskDto = {
  toolId: string;
  payload: Record<string, unknown>;
};

type TaskStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

type Artifact = {
  artifactId: string;
  type: "text" | "image" | "video" | "file";
  objectKey: string;
  metadata?: Record<string, unknown>;
};

type Task = {
  taskId: string;
  toolId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  artifacts: Artifact[];
  error?: { code: string; message: string };
};

const tasks: Task[] = [];

@Controller("ai/tasks")
export class AiTasksController {
  constructor(
    private readonly aiTasks: AiTasksService,
    private readonly queue: AiTaskQueueService,
    private readonly prisma: PrismaService,
    private readonly tools: ToolsService
  ) {}

  /**
   * 创建异步任务
   * TODO:
   * - policy evaluate（是否允许/本次消耗）
   * - quota reserve（预扣 1 次）
   * - enqueue（BullMQ）并返回 taskId
   */
  @Post()
  async create(@Body() dto: CreateTaskDto) {
    const now = new Date().toISOString();

    // 有 DB：落库 task，再决定是否入队
    if (this.prisma.enabled) {
      const taskId = `task_${Math.random().toString(16).slice(2)}`;
      await this.prisma.aiTask.create({
        data: {
          id: taskId,
          toolId: dto.toolId,
          status: "queued",
          payload: dto.payload as Prisma.InputJsonValue
        }
      });

      // 有 Redis：异步执行；否则退化为同步执行（便于早期部署不依赖 Redis）
      if (this.queue.enabled) {
        await this.queue.enqueue(taskId);
      } else {
        const tool = await this.tools.get(dto.toolId);
        const exec = await this.aiTasks.runOnce(
          { toolId: dto.toolId, modality: ((tool?.modalityOut?.[0] as any) ?? "text") as any, payload: dto.payload },
          tool?.providerPolicy as any
        );
        await this.prisma.aiTask.update({
          where: { id: taskId },
          data: { status: "succeeded", providerId: exec.providerId, modelId: exec.model }
        });
        for (const a of exec.artifacts) {
          await this.prisma.aiArtifact.create({
            data: {
              id: `art_${Math.random().toString(16).slice(2)}`,
              taskId,
              type: a.type,
              objectKey: a.tempUrl ?? "TODO:gcs_object_key",
              metadata: { content: a.content, ...a.metadata }
            }
          });
        }
      }

      return { taskId, toolId: dto.toolId, status: "queued", createdAt: now, updatedAt: now, artifacts: [] };
    }

    // 无 DB：回退到内存占位（仅用于早期快速演示）
    const task: Task = {
      taskId: `task_${Math.random().toString(16).slice(2)}`,
      toolId: dto.toolId,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      artifacts: []
    };
    tasks.unshift(task);
    const exec = await this.aiTasks.runOnce({ toolId: dto.toolId, modality: "text", payload: dto.payload }, undefined);
    task.status = "succeeded";
    task.updatedAt = new Date().toISOString();
    task.artifacts = exec.artifacts.map((a) => ({
      artifactId: `art_${Math.random().toString(16).slice(2)}`,
      type: a.type,
      objectKey: a.tempUrl ?? "TODO: gcs objectKey",
      metadata: { content: a.content, providerId: exec.providerId, model: exec.model, ...a.metadata }
    }));
    return task;
  }

  @Get()
  list(@Query("cursor") _cursor?: string) {
    if (this.prisma.enabled) {
      // 先给一个最小实现：DB 查询（不做 cursor）
      return this.prisma.aiTask
        .findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { artifacts: true } })
        .then((items) => ({
          items: items.map((t) => ({
            taskId: t.id,
            toolId: t.toolId,
            status: t.status,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            artifacts: t.artifacts.map((a) => ({
              artifactId: a.id,
              type: a.type,
              objectKey: a.objectKey,
              metadata: a.metadata as any
            })),
            error: (t.error as any) ?? undefined
          })),
          nextCursor: null
        }));
    }
    return { items: tasks.slice(0, 50), nextCursor: null };
  }

  @Get(":taskId")
  get(@Param("taskId") taskId: string) {
    if (this.prisma.enabled) {
      return this.prisma.aiTask.findUnique({ where: { id: taskId }, include: { artifacts: true } }).then((t) => {
        if (!t) return null;
        return {
          taskId: t.id,
          toolId: t.toolId,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          artifacts: t.artifacts.map((a) => ({
            artifactId: a.id,
            type: a.type,
            objectKey: a.objectKey,
            metadata: a.metadata as any
          })),
          error: (t.error as any) ?? undefined
        };
      });
    }
    return tasks.find((t) => t.taskId === taskId) ?? null;
  }

  @Post(":taskId/cancel")
  cancel(@Param("taskId") taskId: string) {
    if (this.prisma.enabled) {
      return this.prisma.aiTask
        .update({ where: { id: taskId }, data: { status: "canceled" } })
        .then(() => ({ ok: true }))
        .catch(() => ({ ok: false }));
    }
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task) return { ok: false };
    task.status = "canceled";
    task.updatedAt = new Date().toISOString();
    return { ok: true };
  }
}

