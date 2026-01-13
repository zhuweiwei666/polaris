// ============ Auth ============
export interface User {
  userId: string;
  deviceId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  providers: Array<{ provider: 'google' | 'apple' | 'email'; linkedAt: string }>;
}

export interface AuthState {
  status: 'loading' | 'guest' | 'authenticated';
  user: User | null;
  accessToken: string | null;
}

export interface AuthService {
  getUser(): User | null;
  getAccessToken(): string | null;
  isAuthenticated(): boolean;
  requireLogin(): Promise<User>;
  loginWithProvider(provider: 'google' | 'apple', idToken: string): Promise<User>;
  logout(): Promise<void>;
  refresh(): Promise<string>;
}

// ============ Billing ============
export interface Product {
  productId: string;
  type: 'subscription' | 'coins' | 'one_time';
  title: string;
  price: { amount: number; currency: string };
  entitlements?: string[];
  coins?: number;
}

export interface Subscription {
  planId: string;
  status: 'active' | 'expired' | 'cancelled';
  expiresAt: string;
  channel: 'appstore' | 'googleplay' | 'stripe';
}

export interface BillingService {
  getProducts(): Promise<Product[]>;
  getSubscription(): Promise<Subscription | null>;
  purchaseSubscription(productId: string): Promise<Subscription>;
  purchaseCoins(productId: string): Promise<{ coins: number }>;
  restore(): Promise<void>;
}

// ============ Entitlement ============
export interface EntitlementState {
  features: Record<string, boolean>;
  quotas: Record<string, { used: number; remaining: number; total: number }>;
}

export interface EntitlementService {
  can(feature: string): boolean;
  use(quotaKey: string, amount?: number): Promise<boolean>;
  limit(quotaKey: string): { used: number; remaining: number; total: number };
  refresh(): Promise<void>;
}

// ============ Config / Feature Flags ============
export interface RemoteConfig {
  featureFlags: Record<string, boolean>;
  params: Record<string, unknown>;
}

export interface ConfigService {
  getFlag(key: string, defaultValue?: boolean): boolean;
  getParam<T>(key: string, defaultValue?: T): T;
  refresh(): Promise<void>;
}

// ============ Analytics ============
export interface AnalyticsService {
  track(event: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(name: string, properties?: Record<string, unknown>): void;
}

// ============ Network ============
export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  onAuthError?: () => void;
  timeout?: number;
  retries?: number;
}

export interface ApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

// ============ Storage ============
export interface StorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ============ Tool (AI Tools module) ============
export interface Tool {
  id: string;
  title: string;
  description: string;
  modalityIn?: string[];
  modalityOut?: string[];
  schema?: {
    type: string;
    properties?: Record<string, ToolSchemaProperty>;
    required?: string[];
  };
  enabled?: boolean;
}

export interface ToolSchemaProperty {
  type: string;
  title?: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  maxLength?: number;
  minLength?: number;
}

// ============ Shell ============
export interface TabItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    error?: string;
    success?: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  fontFamily: string;
}

// ============ App Config ============
export interface ModuleConfig {
  moduleId: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface HomeSection {
  type: 'module-entry' | 'banner' | 'recent-tasks' | 'template-grid' | 'custom';
  moduleId?: string;
  config?: Record<string, unknown>;
}

export interface AppConfig {
  appId: string;
  appName: string;
  version: string;
  modules: ModuleConfig[];
  tabs: TabItem[];
  home: {
    sections: HomeSection[];
  };
  theme: ThemeConfig;
  analytics: {
    provider: 'firebase' | 'amplitude' | 'mixpanel' | 'console';
    key?: string;
  };
  api: {
    baseUrl: string;
  };
  pricing?: {
    freeDailyQuota?: number;
    showPaywall?: boolean;
  };
}
