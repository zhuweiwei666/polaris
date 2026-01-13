import { Module } from "@nestjs/common";
import { AdminProvidersController } from "./providers.controller";
import { AdminToolsController } from "./tools.controller";
import { DbModule } from "../db/db.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [DbModule, AiModule],
  controllers: [AdminProvidersController, AdminToolsController]
})
export class AdminModule {}

