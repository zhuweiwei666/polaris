import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { CurrentUser, Public, type RequestUser } from "../identity/auth.guard";
import { PrismaService } from "../db/prisma.service";

type VerifyAppStoreDto = {
  receiptData: string;
  productId: string;
};

type VerifyGooglePlayDto = {
  packageName: string;
  productId: string;
  purchaseToken: string;
};

@Controller("billing")
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * 获取产品列表
   */
  @Public()
  @Get("products")
  async listProducts() {
    return this.billingService.getProducts();
  }

  /**
   * 获取当前订阅状态
   */
  @Get("subscription")
  async getSubscription(@CurrentUser() user: RequestUser) {
    if (!user || !this.prisma.enabled) {
      return null;
    }
    return this.billingService.getSubscription(user.userId);
  }

  /**
   * 获取钱包
   */
  @Get("wallet")
  async getWallet(@CurrentUser() user: RequestUser) {
    if (!user || !this.prisma.enabled) {
      return { coins: 0, history: [] };
    }
    return this.billingService.getWallet(user.userId);
  }

  /**
   * 获取订单历史
   */
  @Get("orders")
  async getOrders(@CurrentUser() user: RequestUser, @Query("cursor") cursor?: string) {
    if (!user || !this.prisma.enabled) {
      return { items: [], nextCursor: null };
    }
    return this.billingService.getOrders(user.userId, cursor);
  }

  /**
   * 验证 App Store 收据
   */
  @Post("appstore/verify")
  async verifyAppStore(@CurrentUser() user: RequestUser, @Body() dto: VerifyAppStoreDto) {
    if (!user || !this.prisma.enabled) {
      return { success: false, error: "Not available" };
    }

    // TODO: 实现 App Store Server API 验证
    // 1. 调用 App Store Server API 验证收据
    // 2. 解析 transaction info
    // 3. 创建/更新订阅或处理金币购买

    // Mock 实现
    const product = (await this.billingService.getProducts()).find(
      (p) => p.productId === dto.productId
    );

    if (!product) {
      return { success: false, error: "Invalid product" };
    }

    if (product.type === "subscription") {
      const sub = await this.billingService.processSubscription(
        user.userId,
        dto.productId,
        "appstore",
        `appstore_${Date.now()}`
      );
      return { success: true, subscription: sub };
    } else if (product.type === "coins") {
      const wallet = await this.billingService.processCoinsPurchase(
        user.userId,
        dto.productId,
        "appstore",
        `appstore_${Date.now()}`
      );
      return { success: true, wallet };
    }

    return { success: false, error: "Unknown product type" };
  }

  /**
   * 验证 Google Play 购买
   */
  @Post("googleplay/verify")
  async verifyGooglePlay(@CurrentUser() user: RequestUser, @Body() dto: VerifyGooglePlayDto) {
    if (!user || !this.prisma.enabled) {
      return { success: false, error: "Not available" };
    }

    // TODO: 实现 Google Play Developer API 验证
    // 1. 调用 Google Play Developer API 验证 purchaseToken
    // 2. 解析购买信息
    // 3. 创建/更新订阅或处理金币购买

    // Mock 实现
    const product = (await this.billingService.getProducts()).find(
      (p) => p.productId === dto.productId
    );

    if (!product) {
      return { success: false, error: "Invalid product" };
    }

    if (product.type === "subscription") {
      const sub = await this.billingService.processSubscription(
        user.userId,
        dto.productId,
        "googleplay",
        dto.purchaseToken
      );
      return { success: true, subscription: sub };
    } else if (product.type === "coins") {
      const wallet = await this.billingService.processCoinsPurchase(
        user.userId,
        dto.productId,
        "googleplay",
        dto.purchaseToken
      );
      return { success: true, wallet };
    }

    return { success: false, error: "Unknown product type" };
  }

  /**
   * 恢复购买
   */
  @Post("restore")
  async restore(@CurrentUser() user: RequestUser) {
    if (!user || !this.prisma.enabled) {
      return { success: true, subscriptions: [] };
    }

    // 获取用户所有有效订阅
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId: user.userId,
        status: "active",
        expiresAt: { gt: new Date() }
      }
    });

    return { success: true, subscriptions };
  }
}
