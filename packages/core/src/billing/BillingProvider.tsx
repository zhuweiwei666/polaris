'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { BillingProviderProps, BillingService, Product, Subscription, Wallet } from './types';
import { useCoreContext } from '../CoreProvider';
import { useAuth } from '../auth';

const defaultWallet: Wallet = { coins: 0, history: [] };

const BillingContext = createContext<BillingService | null>(null);

export function BillingProvider({
  children,
  productsEndpoint = '/billing/products',
  subscriptionEndpoint = '/billing/subscription'
}: BillingProviderProps) {
  const { api } = useCoreContext();
  const auth = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [wallet, setWallet] = useState<Wallet>(defaultWallet);

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.get<Product[]>(productsEndpoint);
      setProducts(res);
    } catch {
      // 保持现状
    }
  }, [api, productsEndpoint]);

  const loadSubscription = useCallback(async () => {
    if (!auth.isAuthenticated()) {
      setSubscription(null);
      return;
    }
    try {
      const res = await api.get<Subscription | null>(subscriptionEndpoint);
      setSubscription(res);
    } catch {
      setSubscription(null);
    }
  }, [api, subscriptionEndpoint, auth]);

  const loadWallet = useCallback(async () => {
    if (!auth.isAuthenticated()) {
      setWallet(defaultWallet);
      return;
    }
    try {
      const res = await api.get<Wallet>('/billing/wallet');
      setWallet(res);
    } catch {
      setWallet(defaultWallet);
    }
  }, [api, auth]);

  useEffect(() => {
    loadProducts();
    loadSubscription();
    loadWallet();
  }, [loadProducts, loadSubscription, loadWallet]);

  const purchaseSubscription = useCallback(
    async (productId: string): Promise<Subscription> => {
      // TODO: 调用原生 IAP 或 Stripe
      const res = await api.post<Subscription>('/billing/purchase', { productId });
      setSubscription(res);
      return res;
    },
    [api]
  );

  const purchaseCoins = useCallback(
    async (productId: string): Promise<Wallet> => {
      const res = await api.post<Wallet>('/billing/purchase-coins', { productId });
      setWallet(res);
      return res;
    },
    [api]
  );

  const restore = useCallback(async () => {
    await api.post('/billing/restore');
    await loadSubscription();
    await loadWallet();
  }, [api, loadSubscription, loadWallet]);

  const service = useMemo<BillingService>(
    () => ({
      getProducts: () => Promise.resolve(products),
      getSubscription: () => Promise.resolve(subscription),
      getWallet: () => Promise.resolve(wallet),
      purchaseSubscription,
      purchaseCoins,
      restore,
      hasActiveSubscription: () => subscription?.status === 'active',
      getCoinsBalance: () => wallet.coins
    }),
    [products, subscription, wallet, purchaseSubscription, purchaseCoins, restore]
  );

  return <BillingContext.Provider value={service}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingService {
  const ctx = useContext(BillingContext);
  if (!ctx) {
    throw new Error('useBilling must be used within BillingProvider');
  }
  return ctx;
}

export function useSubscription(): Subscription | null {
  const billing = useBilling();
  const [sub, setSub] = useState<Subscription | null>(null);
  useEffect(() => {
    billing.getSubscription().then(setSub);
  }, [billing]);
  return sub;
}

export function useCoins(): number {
  return useBilling().getCoinsBalance();
}
