import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import { Prisma } from "@prisma/client";
import { ProviderConfigService } from "../ai/providers/provider-config.service";

type UpsertProviderDto = {
  id: string;
  displayName: string;
  apiKey?: string;
  baseUrl?: string;
  enabled?: boolean;
};

type UpsertModelDto = {
  id: string;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
};

@Controller("admin/providers")
export class AdminProvidersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerConfig: ProviderConfigService
  ) {}

  private assertDb() {
    if (!this.prisma.enabled) {
      throw new Error("DB not configured. Set DATABASE_URL to enable admin config APIs.");
    }
  }

  @Get()
  async list() {
    this.assertDb();
    // 不返回完整 apiKey，只返回是否已配置
    const providers = await this.prisma.provider.findMany({ include: { models: true }, orderBy: { id: "asc" } });
    return providers.map((p) => ({
      ...p,
      apiKey: p.apiKey ? `${p.apiKey.slice(0, 8)}...` : null,
      hasApiKey: Boolean(p.apiKey)
    }));
  }

  @Post()
  async upsert(@Body() dto: UpsertProviderDto) {
    this.assertDb();
    const result = await this.prisma.provider.upsert({
      where: { id: dto.id },
      create: {
        id: dto.id,
        displayName: dto.displayName,
        apiKey: dto.apiKey,
        baseUrl: dto.baseUrl,
        enabled: dto.enabled ?? true
      },
      update: {
        displayName: dto.displayName,
        apiKey: dto.apiKey,
        baseUrl: dto.baseUrl,
        enabled: dto.enabled ?? true
      }
    });
    // 刷新内存缓存
    await this.providerConfig.reloadDbKeys();
    return { ...result, apiKey: result.apiKey ? "***" : null };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: Partial<UpsertProviderDto>) {
    this.assertDb();
    const data: Prisma.ProviderUpdateInput = {};
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.apiKey !== undefined) data.apiKey = dto.apiKey;
    if (dto.baseUrl !== undefined) data.baseUrl = dto.baseUrl;
    if (dto.enabled !== undefined) data.enabled = dto.enabled;
    const result = await this.prisma.provider.update({ where: { id }, data });
    // 刷新内存缓存
    await this.providerConfig.reloadDbKeys();
    return { ...result, apiKey: result.apiKey ? "***" : null };
  }

  @Get(":id/models")
  async listModels(@Param("id") providerId: string) {
    this.assertDb();
    return this.prisma.providerModel.findMany({ where: { providerId }, orderBy: { id: "asc" } });
  }

  @Post(":id/models")
  async upsertModel(@Param("id") providerId: string, @Body() dto: UpsertModelDto) {
    this.assertDb();
    return this.prisma.providerModel.upsert({
      where: { id: dto.id },
      create: {
        id: dto.id,
        providerId,
        enabled: dto.enabled ?? true,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue
      },
      update: { enabled: dto.enabled ?? true, metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue }
    });
  }
}

