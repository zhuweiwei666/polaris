import { Injectable } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";

export type ToolRecord = {
  toolId: string;
  title: string;
  description: string;
  modalityIn: Array<"text" | "image" | "video" | "file">;
  modalityOut: Array<"text" | "image" | "video" | "file">;
  providerPolicy?: {
    providers?: string[];
    models?: string[];
  };
  schema: Record<string, unknown>;
};

// 默认工具（DB 未启用时的回退）
const defaultTools: ToolRecord[] = [
  {
    toolId: "text.write",
    title: "AI 写作",
    description: "输入主题与要求，生成可编辑文本。",
    modalityIn: ["text"],
    modalityOut: ["text"],
    providerPolicy: { providers: ["openrouter", "a2e"] },
    schema: {
      type: "object",
      properties: {
        prompt: { type: "string", title: "写作要求" },
        tone: { type: "string", title: "风格", default: "neutral" }
      },
      required: ["prompt"]
    }
  },
  {
    toolId: "image.generate",
    title: "AI 生图",
    description: "根据提示词生成图片。",
    modalityIn: ["text"],
    modalityOut: ["image"],
    providerPolicy: { providers: ["openrouter", "a2e"] },
    schema: {
      type: "object",
      properties: {
        prompt: { type: "string", title: "提示词" },
        ratio: { type: "string", title: "比例", default: "1:1" }
      },
      required: ["prompt"]
    }
  },
  {
    toolId: "video.generate",
    title: "AI 生视频",
    description: "根据提示词生成视频（异步，耗时较长）。",
    modalityIn: ["text", "image"],
    modalityOut: ["video"],
    providerPolicy: { providers: ["a2e", "openrouter"] },
    schema: {
      type: "object",
      properties: {
        prompt: { type: "string", title: "提示词" },
        seedImage: { type: "string", title: "参考图（artifact_id 或 url）" }
      },
      required: ["prompt"]
    }
  }
];

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ToolRecord[]> {
    if (!this.prisma.enabled) return defaultTools;
    const rows = await this.prisma.tool.findMany({ where: { enabled: true }, orderBy: { id: "asc" } });
    return rows.map((t) => ({
      toolId: t.id,
      title: t.title,
      description: t.description,
      modalityIn: t.modalityIn as any,
      modalityOut: t.modalityOut as any,
      providerPolicy: (t.providerPolicy as any) ?? undefined,
      schema: t.schema as any
    }));
  }

  async get(toolId: string): Promise<ToolRecord | null> {
    if (!this.prisma.enabled) return defaultTools.find((t) => t.toolId === toolId) ?? null;
    const t = await this.prisma.tool.findUnique({ where: { id: toolId } });
    if (!t || !t.enabled) return null;
    return {
      toolId: t.id,
      title: t.title,
      description: t.description,
      modalityIn: t.modalityIn as any,
      modalityOut: t.modalityOut as any,
      providerPolicy: (t.providerPolicy as any) ?? undefined,
      schema: t.schema as any
    };
  }
}

