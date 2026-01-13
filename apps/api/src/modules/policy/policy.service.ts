import { Injectable } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import { ConfigService } from "@nestjs/config";

export interface RemoteConfigResponse {
  featureFlags: Record<string, boolean>;
  params: Record<string, unknown>;
}

@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  /**
   * 获取远程配置
   */
  async getConfig(context?: {
    platform?: string;
    version?: string;
    userId?: string;
    deviceId?: string;
  }): Promise<RemoteConfigResponse> {
    if (!this.prisma.enabled) {
      // DB 未配置时返回默认配置
      return {
        featureFlags: {
          enableVideo: true,
          enableImage: true,
          enableChat: true,
          showPaywall: true
        },
        params: {
          freeDailyRequests: this.config.get<number>("FREE_DAILY_QUOTA") ?? 5,
          apiVersion: "v1"
        }
      };
    }

    // 从数据库获取 feature flags
    const flags = await this.prisma.featureFlag.findMany({
      where: { enabled: true }
    });

    const featureFlags: Record<string, boolean> = {};
    for (const flag of flags) {
      // 简单的百分比灰度
      if (flag.rollout >= 100) {
        featureFlags[flag.id] = true;
      } else if (flag.rollout <= 0) {
        featureFlags[flag.id] = false;
      } else {
        // 基于 userId 或 deviceId 的一致性 hash
        const seed = context?.userId || context?.deviceId || "";
        const hash = this.simpleHash(seed + flag.id);
        featureFlags[flag.id] = (hash % 100) < flag.rollout;
      }
    }

    // 从数据库获取参数配置
    const configs = await this.prisma.remoteConfig.findMany({
      where: { enabled: true }
    });

    const params: Record<string, unknown> = {};
    for (const cfg of configs) {
      params[cfg.id] = cfg.value;
    }

    return { featureFlags, params };
  }

  /**
   * 简单 hash 函数
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * 更新 feature flag（管理接口）
   */
  async upsertFeatureFlag(
    id: string,
    data: { enabled?: boolean; rollout?: number; description?: string; conditions?: object }
  ) {
    return this.prisma.featureFlag.upsert({
      where: { id },
      create: {
        id,
        enabled: data.enabled ?? false,
        rollout: data.rollout ?? 0,
        description: data.description,
        conditions: data.conditions ?? {}
      },
      update: {
        enabled: data.enabled,
        rollout: data.rollout,
        description: data.description,
        conditions: data.conditions
      }
    });
  }

  /**
   * 更新远程配置（管理接口）
   */
  async upsertConfig(id: string, value: unknown, enabled = true) {
    return this.prisma.remoteConfig.upsert({
      where: { id },
      create: { id, value: value as any, enabled },
      update: { value: value as any, enabled }
    });
  }
}
