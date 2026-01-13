import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import { ConfigService } from "@nestjs/config";
import type { PaymentChannel, WalletTxType } from "@prisma/client";

export interface Product {
  productId: string;
  type: "subscription" | "coins" | "one_time";
  title: string;
  description?: string;
  price: { amount: number; currency: string };
  entitlements?: string[];
  coins?: number;
}

// 硬编码产品列表（后续可迁移到 DB）
const PRODUCTS: Product[] = [
  {
    productId: "free",
    type: "subscription",
    title: "Free",
    price: { amount: 0, currency: "USD" },
    entitlements: []
  },
  {
    productId: "pro_monthly",
    type: "subscription",
    title: "Pro Monthly",
    description: "解锁所有功能，每月续费",
    price: { amount: 999, currency: "USD" },
    entitlements: ["removeAds", "vipContent", "unlockVideo", "unlockImage", "priorityQueue"]
  },
  {
    productId: "pro_yearly",
    type: "subscription",
    title: "Pro Yearly",
    description: "解锁所有功能，年付更优惠",
    price: { amount: 7999, currency: "USD" },
    entitlements: ["removeAds", "vipContent", "unlockVideo", "unlockImage", "priorityQueue"]
  },
  {
    productId: "coins_100",
    type: "coins",
    title: "100 金币",
    price: { amount: 99, currency: "USD" },
    coins: 100
  },
  {
    productId: "coins_500",
    type: "coins",
    title: "500 金币",
    description: "赠送 50 金币",
    price: { amount: 399, currency: "USD" },
    coins: 550
  }
];

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  /**
   * 获取产品列表
   */
  async getProducts(): Promise<Product[]> {
    return PRODUCTS;
  }

  /**
   * 获取用户订阅状态
   */
  async getSubscription(userId: string) {
    if (!this.prisma.enabled) {
      return null;
    }

    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
        expiresAt: { gt: new Date() }
      },
      orderBy: { expiresAt: "desc" }
    });
  }

  /**
   * 获取用户钱包
   */
  async getWallet(userId: string) {
    if (!this.prisma.enabled) {
      return { coins: 0, history: [] };
    }

    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId, coins: 0 },
        include: { transactions: true }
      });
    }

    return {
      coins: wallet.coins,
      history: wallet.transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        createdAt: tx.createdAt.toISOString(),
        description: tx.description
      }))
    };
  }

  /**
   * 处理订阅购买
   */
  async processSubscription(
    userId: string,
    productId: string,
    channel: PaymentChannel,
    txId: string
  ) {
    const product = PRODUCTS.find((p) => p.productId === productId);
    if (!product || product.type !== "subscription") {
      throw new BadRequestException("Invalid subscription product");
    }

    // 计算过期时间
    const expiresAt = new Date();
    if (productId.includes("yearly")) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // 创建订阅
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        productId,
        planId: productId,
        status: "active",
        channel,
        expiresAt,
        originalTxId: txId,
        latestTxId: txId
      }
    });

    // 创建订单
    await this.prisma.order.create({
      data: {
        userId,
        productId,
        type: "subscription",
        status: "completed",
        channel,
        amount: product.price.amount,
        currency: product.price.currency,
        txId
      }
    });

    return subscription;
  }

  /**
   * 处理金币购买
   */
  async processCoinsPurchase(
    userId: string,
    productId: string,
    channel: PaymentChannel,
    txId: string
  ) {
    const product = PRODUCTS.find((p) => p.productId === productId);
    if (!product || product.type !== "coins" || !product.coins) {
      throw new BadRequestException("Invalid coins product");
    }

    // 创建订单
    const order = await this.prisma.order.create({
      data: {
        userId,
        productId,
        type: "coins",
        status: "completed",
        channel,
        amount: product.price.amount,
        currency: product.price.currency,
        txId
      }
    });

    // 添加金币
    const wallet = await this.addCoins(userId, product.coins, "purchase", order.id);

    return wallet;
  }

  /**
   * 添加金币
   */
  async addCoins(
    userId: string,
    amount: number,
    type: WalletTxType,
    relatedId?: string,
    description?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 获取或创建钱包
      let wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId, coins: 0 } });
      }

      // 更新余额
      const newBalance = wallet.coins + amount;
      wallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { coins: newBalance }
      });

      // 记录交易
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          balance: newBalance,
          description,
          relatedId
        }
      });

      return wallet;
    });
  }

  /**
   * 使用金币
   */
  async useCoins(
    userId: string,
    amount: number,
    relatedId?: string,
    description?: string
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet || wallet.coins < amount) {
          throw new Error("Insufficient coins");
        }

        const newBalance = wallet.coins - amount;
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { coins: newBalance }
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "use",
            amount: -amount,
            balance: newBalance,
            description,
            relatedId
          }
        });
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取订单历史
   */
  async getOrders(userId: string, cursor?: string) {
    if (!this.prisma.enabled) {
      return { items: [], nextCursor: null };
    }

    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0
    });

    return {
      items: orders.map((o) => ({
        orderId: o.id,
        productId: o.productId,
        type: o.type,
        status: o.status,
        amount: o.amount,
        currency: o.currency,
        createdAt: o.createdAt.toISOString()
      })),
      nextCursor: orders.length === 20 ? orders[orders.length - 1].id : null
    };
  }
}
