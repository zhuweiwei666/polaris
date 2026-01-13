import { Body, Controller, Get, Post } from "@nestjs/common";

type SocialProvider = "google" | "apple";

type SocialLoginDto = {
  provider: SocialProvider;
  idToken: string;
};

@Controller("auth")
export class AuthController {
  /**
   * 社交登录（Google/Apple）
   * - 客户端拿到 id_token
   * - 服务端校验签名/issuer/audience/nonce
   * - 创建或绑定 user + identity
   * - 签发 access_token/refresh_token
   */
  @Post("social/login")
  socialLogin(@Body() dto: SocialLoginDto) {
    return {
      provider: dto.provider,
      todo: "verify id_token, upsert user, issue tokens",
      accessToken: "TODO",
      refreshToken: "TODO"
    };
  }

  @Post("refresh")
  refresh() {
    return { todo: "rotate refresh token, issue new access token" };
  }

  @Post("logout")
  logout() {
    return { ok: true };
  }

  @Get("me")
  me() {
    return { todo: "return current user profile" };
  }
}

