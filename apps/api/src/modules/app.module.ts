import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DbModule } from "./db/db.module";
import { HealthModule } from "./health/health.module";
import { AiModule } from "./ai/ai.module";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./identity/auth.module";
import { PolicyModule } from "./policy/policy.module";
import { QuotaModule } from "./quota/quota.module";
import { ToolsModule } from "./tools/tools.module";
import { AiTasksModule } from "./ai-tasks/ai-tasks.module";
import { ArtifactsModule } from "./artifacts/artifacts.module";
import { InboxModule } from "./inbox/inbox.module";
import { BillingModule } from "./billing/billing.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DbModule,
    HealthModule,
    AiModule,
    AdminModule,
    AuthModule,
    PolicyModule,
    QuotaModule,
    ToolsModule,
    AiTasksModule,
    ArtifactsModule,
    InboxModule,
    BillingModule
  ]
})
export class AppModule {}

