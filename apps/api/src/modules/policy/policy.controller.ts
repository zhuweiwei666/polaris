import { Controller, Get } from "@nestjs/common";

@Controller("config")
export class PolicyController {
  /**
   * 下发客户端配置（开关、文案、默认参数等）
   * - 免费策略不写死：由 policy engine + 配置表决定
   * - 这里先返回占位，后续接数据库/远程配置
   */
  @Get()
  getConfig() {
    return {
      featureFlags: {
        enableVideo: true,
        enableImage: true
      },
      quota: {
        freeDailyRequests: 5,
        note: "TODO: dynamic policy by platform/country/version/channel"
      }
    };
  }
}

