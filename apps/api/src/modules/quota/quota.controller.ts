import { Body, Controller, Get, Post } from "@nestjs/common";
import { QuotaService } from "./quota.service";
import { CurrentUser, Public, type RequestUser } from "../identity/auth.guard";

type UseQuotaDto = {
  quotaKey: string;
  amount?: number;
};

@Controller("quota")
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  /**
   * 获取当前用户的权益状态
   */
  @Get("me/usage")
  async getMyUsage(@CurrentUser() user: RequestUser) {
    if (!user) {
      return {
        features: {},
        quotas: {
          daily: { used: 0, remaining: 5, total: 5 }
        }
      };
    }

    return this.quotaService.getEntitlementState(user.userId);
  }

  /**
   * 使用配额
   */
  @Post("use")
  async useQuota(@CurrentUser() user: RequestUser, @Body() dto: UseQuotaDto) {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const success = await this.quotaService.useQuota(
      user.userId,
      dto.quotaKey,
      dto.amount ?? 1
    );

    return { success };
  }

  /**
   * 检查是否有权限
   */
  @Public()
  @Get("can/:feature")
  async canAccess(@CurrentUser() user: RequestUser) {
    if (!user) {
      return { can: false };
    }

    // TODO: 从路由参数获取 feature
    return { can: false };
  }
}
