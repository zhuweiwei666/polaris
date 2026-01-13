import { Injectable } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import { ConfigService } from "@nestjs/config";

export interface QuotaInfo {
  used: number;
  remaining: number;
  total: number;
  resetAt?: string;
}

export interface EntitlementState {
  features: Record<string, boolean>;
  quotas: Record<string, QuotaInfo>;
}

@Injectable()
export class QuotaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  /**
   * 获取当前日期的 period key
   */
  private getDailyPeriod(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  /**
   * 获取当前月份的 period key
   */
  private getMonthlyPeriod(): string {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
  }

  /**
   * 获取用户配额限制（根据订阅状态）
   */
  private async getQuotaLimits(userId: string): Promise<Record<string, number>> {
    // 检查是否有活跃订阅
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
        expiresAt: { gt: new Date() }
      }
    });

    if (subscription) {
      // Pro 用户
      return {
        daily: 100,
        monthly: 1000,
        image_gen: 50,
        video_gen: 20
      };
    }

    // 免费用户
    return {
      daily: this.config.get<number>("FREE_DAILY_QUOTA") ?? 5,
      monthly: 50,
      image_gen: 3,
      video_gen: 1
    };
  }

  /**
   * 获取用户的完整权益状态
   */
  async getEntitlementState(userId: string): Promise<EntitlementState> {
    if (!this.prisma.enabled) {
      // DB 未配置时返回默认值
      return {
        features: { removeAds: false, vipContent: false },
        quotas: {
          daily: { used: 0, remaining: 5, total: 5 }
        }
      };
    }

    // 检查订阅
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
        expiresAt: { gt: new Date() }
      }
    });

    const isPro = !!subscription;

    // 获取配额使用情况
    const limits = await this.getQuotaLimits(userId);
    const quotas: Record<string, QuotaInfo> = {};

    for (const [key, limit] of Object.entries(limits)) {
      const period = key === "monthly" ? this.getMonthlyPeriod() : this.getDailyPeriod();
      const usage = await this.prisma.quotaUsage.findUnique({
        where: { userId_quotaKey_period: { userId, quotaKey: key, period } }
      });

      const used = usage?.used ?? 0;
      quotas[key] = {
        used,
        remaining: Math.max(0, limit - used),
        total: limit,
        resetAt: key === "monthly" 
          ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
          : new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      };
    }

    return {
      features: {
        removeAds: isPro,
        vipContent: isPro,
        unlockVideo: isPro,
        unlockImage: isPro,
        priorityQueue: isPro
      },
      quotas
    };
  }

  /**
   * 检查是否可以使用某个配额
   */
  async canUse(userId: string, quotaKey: string, amount = 1): Promise<boolean> {
    const state = await this.getEntitlementState(userId);
    const quota = state.quotas[quotaKey];
    return quota ? quota.remaining >= amount : false;
  }

  /**
   * 使用配额（预扣）
   */
  async useQuota(userId: string, quotaKey: string, amount = 1): Promise<boolean> {
    if (!this.prisma.enabled) {
      return true; // 无 DB 时直接允许
    }

    const period = quotaKey === "monthly" ? this.getMonthlyPeriod() : this.getDailyPeriod();
    const limits = await this.getQuotaLimits(userId);
    const limit = limits[quotaKey] ?? 0;

    // 使用事务确保原子性
    try {
      await this.prisma.$transaction(async (tx) => {
        // 获取或创建使用记录
        const usage = await tx.quotaUsage.upsert({
          where: { userId_quotaKey_period: { userId, quotaKey, period } },
          create: { userId, quotaKey, period, used: 0 },
          update: {}
        });

        // 检查是否超限
        if (usage.used + amount > limit) {
          throw new Error("Quota exceeded");
        }

        // 更新使用量
        await tx.quotaUsage.update({
          where: { id: usage.id },
          data: { used: usage.used + amount }
        });
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 释放配额（任务失败时回滚）
   */
  async releaseQuota(userId: string, quotaKey: string, amount = 1): Promise<void> {
    if (!this.prisma.enabled) return;

    const period = quotaKey === "monthly" ? this.getMonthlyPeriod() : this.getDailyPeriod();

    await this.prisma.quotaUsage.updateMany({
      where: { userId, quotaKey, period },
      data: { used: { decrement: amount } }
    });
  }

  /**
   * 检查是否有某项权益
   */
  async canAccess(userId: string, feature: string): Promise<boolean> {
    const state = await this.getEntitlementState(userId);
    return state.features[feature] ?? false;
  }
}
