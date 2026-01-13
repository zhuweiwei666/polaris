import { Module } from "@nestjs/common";
import { AdminProvidersController } from "./providers.controller";
import { AdminToolsController } from "./tools.controller";

@Module({
  controllers: [AdminProvidersController, AdminToolsController]
})
export class AdminModule {}

