import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";

type UpsertToolDto = {
  id: string;
  title: string;
  description: string;
  modalityIn: string[];
  modalityOut: string[];
  schema: Record<string, unknown>;
  providerPolicy?: Record<string, unknown>;
  enabled?: boolean;
};

@Controller("admin/tools")
export class AdminToolsController {
  constructor(private readonly prisma: PrismaService) {}

  private assertDb() {
    if (!this.prisma.enabled) {
      throw new Error("DB not configured. Set DATABASE_URL to enable admin config APIs.");
    }
  }

  @Get()
  async list() {
    this.assertDb();
    return this.prisma.tool.findMany({ orderBy: { id: "asc" } });
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    this.assertDb();
    return this.prisma.tool.findUnique({ where: { id } });
  }

  @Post()
  async upsert(@Body() dto: UpsertToolDto) {
    this.assertDb();
    return this.prisma.tool.upsert({
      where: { id: dto.id },
      create: {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        modalityIn: dto.modalityIn,
        modalityOut: dto.modalityOut,
        schema: dto.schema,
        providerPolicy: dto.providerPolicy ?? {},
        enabled: dto.enabled ?? true
      },
      update: {
        title: dto.title,
        description: dto.description,
        modalityIn: dto.modalityIn,
        modalityOut: dto.modalityOut,
        schema: dto.schema,
        providerPolicy: dto.providerPolicy ?? {},
        enabled: dto.enabled ?? true
      }
    });
  }

  @Patch(":id")
  async patch(@Param("id") id: string, @Body() dto: Partial<UpsertToolDto>) {
    this.assertDb();
    return this.prisma.tool.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        modalityIn: dto.modalityIn,
        modalityOut: dto.modalityOut,
        schema: dto.schema,
        providerPolicy: dto.providerPolicy,
        enabled: dto.enabled
      }
    });
  }
}

