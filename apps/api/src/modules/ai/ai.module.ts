import { Module } from "@nestjs/common";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { A2eProvider } from "./providers/a2e.provider";
import { ProviderRegistryService } from "./providers/provider-registry.service";
import { AiRouterService } from "./ai-router.service";

@Module({
  providers: [OpenRouterProvider, A2eProvider, ProviderRegistryService, AiRouterService],
  exports: [ProviderRegistryService, AiRouterService]
})
export class AiModule {}

