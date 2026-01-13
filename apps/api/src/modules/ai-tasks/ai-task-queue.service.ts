import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import { AiTasksWorkerService } from "./ai-tasks.worker";

type QueueJob = {
  taskId: string;
};

@Injectable()
export class AiTaskQueueService implements OnModuleInit, OnModuleDestroy {
  private queue: Queue<QueueJob> | null = null;
  private worker: Worker<QueueJob> | null = null;

  constructor(private readonly workerService: AiTasksWorkerService) {}

  get enabled() {
    return Boolean(process.env.REDIS_URL);
  }

  async onModuleInit() {
    if (!process.env.REDIS_URL) return;

    const connection = { url: process.env.REDIS_URL };

    this.queue = new Queue<QueueJob>("ai-tasks", { connection });
    this.worker = new Worker<QueueJob>(
      "ai-tasks",
      async (job) => {
        await this.workerService.handle(job.data.taskId);
      },
      { connection }
    );
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }

  async enqueue(taskId: string) {
    if (!this.queue) {
      throw new Error("Queue not enabled. Set REDIS_URL to enable async tasks.");
    }
    await this.queue.add("run", { taskId });
  }
}

