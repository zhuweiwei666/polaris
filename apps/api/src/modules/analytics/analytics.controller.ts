import { Body, Controller, Post, Headers } from "@nestjs/common";
import { AnalyticsService, type TrackEventDto } from "./analytics.service";
import { CurrentUser, Public, type RequestUser } from "../identity/auth.guard";

type TrackDto = {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
};

type BatchTrackDto = {
  events: TrackDto[];
};

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * 记录单个事件
   */
  @Public()
  @Post("track")
  async track(
    @Body() dto: TrackDto,
    @CurrentUser() user: RequestUser | undefined,
    @Headers("x-device-id") deviceId?: string,
    @Headers("x-app-id") appId?: string,
    @Headers("x-module-id") moduleId?: string
  ) {
    await this.analyticsService.track({
      name: dto.name,
      properties: dto.properties,
      timestamp: dto.timestamp,
      userId: user?.userId,
      deviceId: deviceId ?? user?.deviceId,
      appId,
      moduleId
    });

    return { ok: true };
  }

  /**
   * 批量记录事件
   */
  @Public()
  @Post("track/batch")
  async trackBatch(
    @Body() dto: BatchTrackDto,
    @CurrentUser() user: RequestUser | undefined,
    @Headers("x-device-id") deviceId?: string,
    @Headers("x-app-id") appId?: string
  ) {
    const events: TrackEventDto[] = dto.events.map((e) => ({
      name: e.name,
      properties: e.properties,
      timestamp: e.timestamp,
      userId: user?.userId,
      deviceId: deviceId ?? user?.deviceId,
      appId
    }));

    await this.analyticsService.trackBatch(events);

    return { ok: true, count: events.length };
  }
}
