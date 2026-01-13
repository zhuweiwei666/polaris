'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type {
  EntitlementProviderProps,
  EntitlementResponse,
  EntitlementService,
  EntitlementState,
  QuotaInfo
} from './types';
import { useCoreContext } from '../CoreProvider';
import { useAuth } from '../auth';

const defaultState: EntitlementState = {
  features: {},
  quotas: {}
};

const defaultQuota: QuotaInfo = { used: 0, remaining: 0, total: 0 };

const EntitlementContext = createContext<EntitlementService | null>(null);

export function EntitlementProvider({
  children,
  endpoint = '/quota/me/usage',
  initialState
}: EntitlementProviderProps) {
  const { api, appConfig } = useCoreContext();
  const auth = useAuth();
  const [state, setState] = useState<EntitlementState>(initialState ?? defaultState);
  const [loaded, setLoaded] = useState(!!initialState);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<EntitlementResponse>(endpoint);
      setState({
        features: res.features ?? {},
        quotas: res.quotas ?? {}
      });
      setLoaded(true);
    } catch {
      // 加载失败使用默认配置
      const freeDailyQuota = appConfig.pricing?.freeDailyQuota ?? 5;
      setState({
        features: {},
        quotas: {
          daily: { used: 0, remaining: freeDailyQuota, total: freeDailyQuota }
        }
      });
      setLoaded(true);
    }
  }, [api, endpoint, appConfig.pricing?.freeDailyQuota]);

  // 登录状态变化时刷新
  useEffect(() => {
    refresh();
  }, [refresh, auth.isAuthenticated()]);

  const can = useCallback(
    (feature: string): boolean => {
      return state.features[feature] ?? false;
    },
    [state.features]
  );

  const limit = useCallback(
    (quotaKey: string): QuotaInfo => {
      return state.quotas[quotaKey] ?? defaultQuota;
    },
    [state.quotas]
  );

  const use = useCallback(
    async (quotaKey: string, amount = 1): Promise<boolean> => {
      const quota = state.quotas[quotaKey];
      if (!quota || quota.remaining < amount) {
        return false;
      }

      // 乐观更新
      setState((s) => ({
        ...s,
        quotas: {
          ...s.quotas,
          [quotaKey]: {
            ...quota,
            used: quota.used + amount,
            remaining: quota.remaining - amount
          }
        }
      }));

      try {
        // 调用 API 预扣
        await api.post('/quota/use', { quotaKey, amount });
        return true;
      } catch {
        // 回滚
        setState((s) => ({
          ...s,
          quotas: {
            ...s.quotas,
            [quotaKey]: quota
          }
        }));
        return false;
      }
    },
    [api, state.quotas]
  );

  const service = useMemo<EntitlementService>(
    () => ({
      can,
      use,
      limit,
      refresh,
      isLoaded: () => loaded
    }),
    [can, use, limit, refresh, loaded]
  );

  return <EntitlementContext.Provider value={service}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement(): EntitlementService {
  const ctx = useContext(EntitlementContext);
  if (!ctx) {
    throw new Error('useEntitlement must be used within EntitlementProvider');
  }
  return ctx;
}

export function useCan(feature: string): boolean {
  return useEntitlement().can(feature);
}

export function useQuota(quotaKey: string): QuotaInfo {
  return useEntitlement().limit(quotaKey);
}
