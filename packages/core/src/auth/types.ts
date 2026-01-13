export interface User {
  userId: string;
  deviceId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  providers: Array<{ provider: 'google' | 'apple' | 'email'; linkedAt: string }>;
  createdAt?: string;
}

export type AuthStatus = 'loading' | 'guest' | 'authenticated';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
}

export interface AuthService {
  /** 获取当前用户 */
  getUser(): User | null;
  /** 获取 access token */
  getAccessToken(): string | null;
  /** 是否已登录 */
  isAuthenticated(): boolean;
  /** 是否正在加载 */
  isLoading(): boolean;
  /** 要求登录（弹出登录 UI 或跳转） */
  requireLogin(): Promise<User>;
  /** 第三方登录 */
  loginWithProvider(provider: 'google' | 'apple', idToken: string): Promise<User>;
  /** 登出 */
  logout(): Promise<void>;
  /** 刷新 token */
  refresh(): Promise<string>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  /** 登录 UI 组件（requireLogin 时显示） */
  LoginComponent?: React.ComponentType<{ onSuccess: (user: User) => void }>;
  /** token 存储 key */
  tokenKey?: string;
  /** 用户信息存储 key */
  userKey?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
