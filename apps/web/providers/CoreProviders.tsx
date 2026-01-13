'use client';

import { useState, type ReactNode } from 'react';
import {
  CoreProvider,
  AuthProvider,
  BillingProvider,
  EntitlementProvider,
  ConfigProvider,
  AnalyticsProvider,
  type User
} from '@polaris/core';
import appConfig from '../app.config';
import { LoginModal } from '../app/components/LoginModal';

interface CoreProvidersProps {
  children: ReactNode;
}

// 登录组件包装器
function LoginWrapper({ onSuccess }: { onSuccess: (user: User) => void }) {
  return <LoginModal onSuccess={onSuccess} />;
}

/**
 * App 级 Providers 组合
 * 将所有 Core providers 按正确顺序嵌套
 */
export function CoreProviders({ children }: CoreProvidersProps) {
  return (
    <CoreProvider appConfig={appConfig}>
      <AuthProvider LoginComponent={LoginWrapper}>
        <BillingProvider>
          <EntitlementProvider>
            <ConfigProvider>
              <AnalyticsProvider debug={process.env.NODE_ENV === 'development'}>
                {children}
              </AnalyticsProvider>
            </ConfigProvider>
          </EntitlementProvider>
        </BillingProvider>
      </AuthProvider>
    </CoreProvider>
  );
}
