import { Controller, Get, Headers } from "@nestjs/common";
import { PolicyService } from "./policy.service";
import { CurrentUser, Public, type RequestUser } from "../identity/auth.guard";

@Controller("config")
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  /**
   * 下发客户端配置（开关、文案、默认参数等）
   */
  @Public()
  @Get()
  async getConfig(
    @CurrentUser() user: RequestUser | undefined,
    @Headers("x-platform") platform?: string,
    @Headers("x-app-version") version?: string,
    @Headers("x-device-id") deviceId?: string
  ) {
    return this.policyService.getConfig({
      platform,
      version,
      userId: user?.userId,
      deviceId: deviceId ?? user?.deviceId
    });
  }
}
