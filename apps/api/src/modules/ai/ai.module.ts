import { Module } from "@nestjs/common";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { A2eProvider } from "./providers/a2e.provider";
import { MockProvider } from "./providers/mock.provider";
import { ProviderConfigService } from "./providers/provider-config.service";
import { ProviderRegistryService } from "./providers/provider-registry.service";
import { AiRouterService } from "./ai-router.service";
import { DbModule } from "../db/db.module";

@Module({
  imports: [DbModule],
  providers: [ProviderConfigService, OpenRouterProvider, A2eProvider, MockProvider, ProviderRegistryService, AiRouterService],
  exports: [ProviderConfigService, ProviderRegistryService, AiRouterService]
})
export class AiModule {}

