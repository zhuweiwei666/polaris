import { Body, Controller, Get, Post, Headers, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public, CurrentUser, type RequestUser } from "./auth.guard";
import { PrismaService } from "../db/prisma.service";

type SocialProvider = "google" | "apple";

type SocialLoginDto = {
  provider: SocialProvider;
  idToken: string;
  deviceId?: string;
};

type RefreshDto = {
  refreshToken: string;
};

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * 社交登录（Google/Apple）
   */
  @Public()
  @Post("social/login")
  @HttpCode(HttpStatus.OK)
  async socialLogin(@Body() dto: SocialLoginDto) {
    if (!this.prisma.enabled) {
      // DB 未配置时返回 mock 数据（便于开发）
      return {
        user: {
          userId: "mock_user_1",
          email: "mock@example.com",
          displayName: "Mock User",
          providers: [{ provider: dto.provider, linkedAt: new Date().toISOString() }]
        },
        accessToken: "mock_access_token",
        refreshToken: "mock_refresh_token"
      };
    }

    return this.authService.socialLogin(dto.provider, dto.idToken, dto.deviceId);
  }

  /**
   * 刷新 token
   */
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    if (!this.prisma.enabled) {
      return {
        accessToken: "mock_access_token_refreshed",
        refreshToken: "mock_refresh_token_refreshed"
      };
    }

    return this.authService.refreshTokens(dto.refreshToken);
  }

  /**
   * 登出
   */
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: RequestUser,
    @Body() body: { refreshToken?: string }
  ) {
    if (!this.prisma.enabled || !user) {
      return { ok: true };
    }

    await this.authService.logout(user.userId, body.refreshToken);
    return { ok: true };
  }

  /**
   * 获取当前用户信息
   */
  @Get("me")
  async me(@CurrentUser() user: RequestUser) {
    if (!this.prisma.enabled || !user) {
      return {
        userId: "guest",
        displayName: "Guest User",
        providers: []
      };
    }

    const userData = await this.authService.getUser(user.userId);
    if (!userData) {
      return {
        userId: user.userId,
        displayName: "Unknown",
        providers: []
      };
    }

    return userData;
  }
}
