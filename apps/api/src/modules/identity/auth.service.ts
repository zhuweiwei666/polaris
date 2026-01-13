import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import * as jose from "jose";
import { PrismaService } from "../db/prisma.service";
import type { User, Identity, IdentityProvider } from "@prisma/client";

export interface JwtPayload {
  sub: string; // userId
  email?: string;
  deviceId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: {
    userId: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    providers: Array<{ provider: string; linkedAt: string }>;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {
    const googleClientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    if (googleClientId) {
      this.googleClient = new OAuth2Client(googleClientId);
    }
  }

  /**
   * 验证 Google ID Token
   */
  async verifyGoogleToken(idToken: string): Promise<{ sub: string; email?: string; name?: string; picture?: string }> {
    if (!this.googleClient) {
      throw new UnauthorizedException("Google login not configured");
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.config.get<string>("GOOGLE_CLIENT_ID")
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub) {
        throw new UnauthorizedException("Invalid Google token");
      }
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };
    } catch (err) {
      throw new UnauthorizedException("Google token verification failed");
    }
  }

  /**
   * 验证 Apple ID Token
   */
  async verifyAppleToken(idToken: string): Promise<{ sub: string; email?: string }> {
    try {
      // Apple 公钥
      const JWKS = jose.createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
      
      const { payload } = await jose.jwtVerify(idToken, JWKS, {
        issuer: "https://appleid.apple.com",
        audience: this.config.get<string>("APPLE_CLIENT_ID")
      });

      if (!payload.sub) {
        throw new UnauthorizedException("Invalid Apple token");
      }

      return {
        sub: payload.sub as string,
        email: payload.email as string | undefined
      };
    } catch (err) {
      throw new UnauthorizedException("Apple token verification failed");
    }
  }

  /**
   * 社交登录
   */
  async socialLogin(
    provider: "google" | "apple",
    idToken: string,
    deviceId?: string
  ): Promise<AuthResult> {
    // 1. 验证 token
    let providerData: { sub: string; email?: string; name?: string; picture?: string };
    
    if (provider === "google") {
      providerData = await this.verifyGoogleToken(idToken);
    } else {
      providerData = await this.verifyAppleToken(idToken);
    }

    // 2. 查找或创建用户
    const { user, identity } = await this.findOrCreateUser(
      provider,
      providerData.sub,
      providerData.email,
      providerData.name,
      providerData.picture
    );

    // 3. 更新设备
    if (deviceId) {
      await this.linkDevice(user.id, deviceId);
    }

    // 4. 生成 tokens
    const tokens = await this.generateTokens(user.id, user.email ?? undefined, deviceId);

    // 5. 获取用户完整信息
    const identities = await this.prisma.identity.findMany({
      where: { userId: user.id }
    });

    return {
      user: {
        userId: user.id,
        email: user.email ?? undefined,
        displayName: user.displayName ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        providers: identities.map((i) => ({
          provider: i.provider,
          linkedAt: i.createdAt.toISOString()
        }))
      },
      ...tokens
    };
  }

  /**
   * 查找或创建用户
   */
  private async findOrCreateUser(
    provider: IdentityProvider,
    providerId: string,
    email?: string,
    name?: string,
    picture?: string
  ): Promise<{ user: User; identity: Identity }> {
    // 查找现有 identity
    const existingIdentity = await this.prisma.identity.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true }
    });

    if (existingIdentity) {
      // 更新用户信息（如果有新数据）
      if (name || picture) {
        await this.prisma.user.update({
          where: { id: existingIdentity.userId },
          data: {
            displayName: name ?? existingIdentity.user.displayName,
            avatarUrl: picture ?? existingIdentity.user.avatarUrl
          }
        });
      }
      return { user: existingIdentity.user, identity: existingIdentity };
    }

    // 如果有邮箱，尝试关联到现有用户
    let user: User | null = null;
    if (email) {
      user = await this.prisma.user.findUnique({ where: { email } });
    }

    // 创建新用户
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          displayName: name,
          avatarUrl: picture
        }
      });

      // 创建钱包
      await this.prisma.wallet.create({
        data: {
          userId: user.id,
          coins: 0
        }
      });
    }

    // 创建 identity
    const newIdentity = await this.prisma.identity.create({
      data: {
        userId: user.id,
        provider,
        providerId,
        email
      }
    });

    return { user, identity: newIdentity };
  }

  /**
   * 关联设备
   */
  private async linkDevice(userId: string, deviceId: string): Promise<void> {
    await this.prisma.device.upsert({
      where: { deviceId },
      create: {
        userId,
        deviceId,
        platform: "web", // TODO: 从请求头获取
        lastActiveAt: new Date()
      },
      update: {
        userId,
        lastActiveAt: new Date()
      }
    });
  }

  /**
   * 生成 token 对
   */
  async generateTokens(userId: string, email?: string, deviceId?: string): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email, deviceId };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES") ?? "15m"
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES") ?? "7d"
    });

    // 保存 refresh token
    const decoded = this.jwt.decode(refreshToken) as { exp: number };
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        deviceId,
        expiresAt: new Date(decoded.exp * 1000)
      }
    });

    return { accessToken, refreshToken };
  }

  /**
   * 刷新 token
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // 验证 token
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify(refreshToken) as JwtPayload;
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // 检查数据库中是否存在
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token expired or revoked");
    }

    // 删除旧 token
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // 生成新 tokens
    return this.generateTokens(payload.sub, payload.email, payload.deviceId);
  }

  /**
   * 登出
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken }
      });
    } else {
      // 登出所有设备
      await this.prisma.refreshToken.deleteMany({
        where: { userId }
      });
    }
  }

  /**
   * 获取用户信息
   */
  async getUser(userId: string): Promise<AuthResult["user"] | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { identities: true }
    });

    if (!user) return null;

    return {
      userId: user.id,
      email: user.email ?? undefined,
      displayName: user.displayName ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      providers: user.identities.map((i) => ({
        provider: i.provider,
        linkedAt: i.createdAt.toISOString()
      }))
    };
  }

  /**
   * 验证 access token
   */
  validateAccessToken(token: string): JwtPayload {
    try {
      return this.jwt.verify(token) as JwtPayload;
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }
}
