import { Controller, Get, Param } from "@nestjs/common";
import { ToolsService } from "./tools.service";

@Controller("tools")
export class ToolsController {
  constructor(private readonly tools: ToolsService) {}

  @Get()
  async list() {
    return this.tools.list();
  }

  @Get(":toolId")
  async get(@Param("toolId") toolId: string) {
    return this.tools.get(toolId);
  }
}

