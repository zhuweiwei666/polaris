'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { AuthProviderProps, AuthService, AuthState, LoginResponse, User } from './types';
import { useCoreContext } from '../CoreProvider';
import { generateDeviceId } from './deviceId';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token';
const AUTH_USER_KEY = 'auth_user';

const AuthContext = createContext<AuthService | null>(null);

export function AuthProvider({
  children,
  LoginComponent,
  tokenKey = AUTH_TOKEN_KEY,
  userKey = AUTH_USER_KEY
}: AuthProviderProps) {
  const { api, storage } = useCoreContext();

  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    accessToken: null
  });

  const [showLogin, setShowLogin] = useState(false);
  const [loginResolve, setLoginResolve] = useState<((user: User) => void) | null>(null);

  // 初始化：从 storage 恢复登录状态
  useEffect(() => {
    (async () => {
      try {
        const [token, user] = await Promise.all([
          storage.get<string>(tokenKey),
          storage.get<User>(userKey)
        ]);

        if (token && user) {
          setState({ status: 'authenticated', user, accessToken: token });
        } else {
          // 生成 deviceId（游客状态也需要）
          let deviceId = await storage.get<string>('device_id');
          if (!deviceId) {
            deviceId = generateDeviceId();
            await storage.set('device_id', deviceId);
          }
          setState({ status: 'guest', user: null, accessToken: null });
        }
      } catch {
        setState({ status: 'guest', user: null, accessToken: null });
      }
    })();
  }, [storage, tokenKey, userKey]);

  const loginWithProvider = useCallback(
    async (provider: 'google' | 'apple', idToken: string): Promise<User> => {
      const res = await api.post<LoginResponse>('/auth/social/login', { provider, idToken });
      await storage.set(tokenKey, res.accessToken);
      await storage.set(AUTH_REFRESH_TOKEN_KEY, res.refreshToken);
      await storage.set(userKey, res.user);
      setState({ status: 'authenticated', user: res.user, accessToken: res.accessToken });
      return res.user;
    },
    [api, storage, tokenKey, userKey]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // 忽略登出 API 错误
    }
    await storage.remove(tokenKey);
    await storage.remove(AUTH_REFRESH_TOKEN_KEY);
    await storage.remove(userKey);
    setState({ status: 'guest', user: null, accessToken: null });
  }, [api, storage, tokenKey, userKey]);

  const refresh = useCallback(async (): Promise<string> => {
    const refreshToken = await storage.get<string>(AUTH_REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('No refresh token');

    const res = await api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken
    });
    await storage.set(tokenKey, res.accessToken);
    await storage.set(AUTH_REFRESH_TOKEN_KEY, res.refreshToken);
    setState((s) => ({ ...s, accessToken: res.accessToken }));
    return res.accessToken;
  }, [api, storage, tokenKey]);

  const requireLogin = useCallback((): Promise<User> => {
    if (state.user) return Promise.resolve(state.user);

    return new Promise<User>((resolve) => {
      setLoginResolve(() => resolve);
      setShowLogin(true);
    });
  }, [state.user]);

  const handleLoginSuccess = useCallback(
    (user: User) => {
      setShowLogin(false);
      loginResolve?.(user);
      setLoginResolve(null);
    },
    [loginResolve]
  );

  const service = useMemo<AuthService>(
    () => ({
      getUser: () => state.user,
      getAccessToken: () => state.accessToken,
      isAuthenticated: () => state.status === 'authenticated',
      isLoading: () => state.status === 'loading',
      requireLogin,
      loginWithProvider,
      logout,
      refresh
    }),
    [state, requireLogin, loginWithProvider, logout, refresh]
  );

  return (
    <AuthContext.Provider value={service}>
      {children}
      {showLogin && LoginComponent && <LoginComponent onSuccess={handleLoginSuccess} />}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthService {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function useUser(): User | null {
  return useAuth().getUser();
}

export function useIsAuthenticated(): boolean {
  return useAuth().isAuthenticated();
}
