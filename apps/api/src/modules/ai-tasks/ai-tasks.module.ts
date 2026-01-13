import { Module } from "@nestjs/common";
import { AiTasksController } from "./ai-tasks.controller";
import { AiTasksService } from "./ai-tasks.service";
import { AiModule } from "../ai/ai.module";
import { AiTaskQueueService } from "./ai-task-queue.service";
import { AiTasksWorkerService } from "./ai-tasks.worker";
import { ToolsModule } from "../tools/tools.module";

@Module({
  imports: [AiModule, ToolsModule],
  controllers: [AiTasksController],
  providers: [AiTasksService, AiTasksWorkerService, AiTaskQueueService]
})
export class AiTasksModule {}

