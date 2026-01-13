export interface Product {
  productId: string;
  type: 'subscription' | 'coins' | 'one_time';
  title: string;
  description?: string;
  price: { amount: number; currency: string };
  entitlements?: string[];
  coins?: number;
}

export interface Subscription {
  planId: string;
  productId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  expiresAt: string;
  channel: 'appstore' | 'googleplay' | 'stripe';
  autoRenew?: boolean;
}

export interface Wallet {
  coins: number;
  history?: Array<{
    id: string;
    type: 'purchase' | 'use' | 'refund' | 'bonus';
    amount: number;
    createdAt: string;
    description?: string;
  }>;
}

export interface BillingService {
  /** 获取商品列表 */
  getProducts(): Promise<Product[]>;
  /** 获取当前订阅状态 */
  getSubscription(): Promise<Subscription | null>;
  /** 获取钱包（coins）*/
  getWallet(): Promise<Wallet>;
  /** 购买订阅 */
  purchaseSubscription(productId: string): Promise<Subscription>;
  /** 购买 coins */
  purchaseCoins(productId: string): Promise<Wallet>;
  /** 恢复购买 */
  restore(): Promise<void>;
  /** 是否有有效订阅 */
  hasActiveSubscription(): boolean;
  /** coins 余额 */
  getCoinsBalance(): number;
}

export interface BillingProviderProps {
  children: React.ReactNode;
  /** 商品端点 */
  productsEndpoint?: string;
  /** 订阅端点 */
  subscriptionEndpoint?: string;
}
