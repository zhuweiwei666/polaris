import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import { Prisma } from "@prisma/client";

type UpsertProviderDto = {
  id: string;
  displayName: string;
  enabled?: boolean;
};

type UpsertModelDto = {
  id: string;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
};

@Controller("admin/providers")
export class AdminProvidersController {
  constructor(private readonly prisma: PrismaService) {}

  private assertDb() {
    if (!this.prisma.enabled) {
      throw new Error("DB not configured. Set DATABASE_URL to enable admin config APIs.");
    }
  }

  @Get()
  async list() {
    this.assertDb();
    return this.prisma.provider.findMany({ include: { models: true }, orderBy: { id: "asc" } });
  }

  @Post()
  async upsert(@Body() dto: UpsertProviderDto) {
    this.assertDb();
    return this.prisma.provider.upsert({
      where: { id: dto.id },
      create: { id: dto.id, displayName: dto.displayName, enabled: dto.enabled ?? true },
      update: { displayName: dto.displayName, enabled: dto.enabled ?? true }
    });
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: Partial<UpsertProviderDto>) {
    this.assertDb();
    return this.prisma.provider.update({
      where: { id },
      data: { displayName: dto.displayName, enabled: dto.enabled }
    });
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

