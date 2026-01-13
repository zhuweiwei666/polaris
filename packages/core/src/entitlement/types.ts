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

export interface EntitlementService {
  /** 判断是否有某项权益 */
  can(feature: string): boolean;
  /** 使用配额（预扣），返回是否成功 */
  use(quotaKey: string, amount?: number): Promise<boolean>;
  /** 查询剩余配额 */
  limit(quotaKey: string): QuotaInfo;
  /** 刷新权益状态 */
  refresh(): Promise<void>;
  /** 是否已加载 */
  isLoaded(): boolean;
}

export interface EntitlementProviderProps {
  children: React.ReactNode;
  /** API 端点 */
  endpoint?: string;
  /** 初始状态（SSR） */
  initialState?: EntitlementState;
}

export interface EntitlementResponse {
  features: Record<string, boolean>;
  quotas: Record<string, QuotaInfo>;
}
