import { Injectable } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";

export interface TrackEventDto {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  deviceId?: string;
  appId?: string;
  moduleId?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 记录事件
   */
  async track(event: TrackEventDto): Promise<void> {
    if (!this.prisma.enabled) {
      // 无 DB 时打印到控制台
      console.log("[Analytics]", event.name, event.properties);
      return;
    }

    await this.prisma.analyticsEvent.create({
      data: {
        name: event.name,
        userId: event.userId,
        deviceId: event.deviceId,
        appId: event.appId ?? "unknown",
        moduleId: event.moduleId,
        properties: JSON.parse(JSON.stringify(event.properties ?? {})),
        timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
      }
    });
  }

  /**
   * 批量记录事件
   */
  async trackBatch(events: TrackEventDto[]): Promise<void> {
    if (!this.prisma.enabled) {
      events.forEach((e) => console.log("[Analytics]", e.name, e.properties));
      return;
    }

    await this.prisma.analyticsEvent.createMany({
      data: events.map((e) => ({
        name: e.name,
        userId: e.userId,
        deviceId: e.deviceId,
        appId: e.appId ?? "unknown",
        moduleId: e.moduleId,
        properties: JSON.parse(JSON.stringify(e.properties ?? {})),
        timestamp: e.timestamp ? new Date(e.timestamp) : new Date()
      }))
    });
  }

  /**
   * 查询事件（管理接口）
   */
  async queryEvents(filters: {
    name?: string;
    userId?: string;
    appId?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }) {
    if (!this.prisma.enabled) {
      return [];
    }

    return this.prisma.analyticsEvent.findMany({
      where: {
        name: filters.name,
        userId: filters.userId,
        appId: filters.appId,
        timestamp: {
          gte: filters.startTime,
          lte: filters.endTime
        }
      },
      orderBy: { timestamp: "desc" },
      take: filters.limit ?? 100
    });
  }
}
