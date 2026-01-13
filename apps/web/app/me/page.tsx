'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useUser, useBilling, useSubscription, useEntitlement } from '@polaris/core';

export default function MePage() {
  const router = useRouter();
  const auth = useAuth();
  const user = useUser();
  const billing = useBilling();
  const subscription = useSubscription();
  const entitlement = useEntitlement();
  const quota = entitlement.limit('daily');

  const handleLogin = async () => {
    try {
      await auth.requireLogin();
    } catch {
      // 用户取消登录
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    router.refresh();
  };

  // 未登录状态
  if (!user) {
    return (
      <div className="me-page">
        <div className="me-guest">
          <div className="me-guest__avatar">👤</div>
          <h1>欢迎使用</h1>
          <p>登录后可同步数据、解锁更多功能</p>
          <button className="btn btn--primary" onClick={handleLogin}>
            登录 / 注册
          </button>
        </div>

        <div className="me-features">
          <h3>登录后可享受</h3>
          <div className="me-features__list">
            <div className="me-feature">
              <span className="me-feature__icon">☁️</span>
              <span>多端数据同步</span>
            </div>
            <div className="me-feature">
              <span className="me-feature__icon">📊</span>
              <span>作品历史记录</span>
            </div>
            <div className="me-feature">
              <span className="me-feature__icon">💎</span>
              <span>更多免费次数</span>
            </div>
          </div>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  // 已登录状态
  const isPro = subscription?.status === 'active';

  return (
    <div className="me-page">
      {/* 用户信息卡片 */}
      <div className="me-card me-profile">
        <div className="me-profile__avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} />
          ) : (
            <span>{user.displayName?.charAt(0) || user.email?.charAt(0) || '👤'}</span>
          )}
        </div>
        <div className="me-profile__info">
          <h2>{user.displayName || '用户'}</h2>
          <p>{user.email || 'No email'}</p>
          <div className="me-profile__badge">
            {isPro ? (
              <span className="badge badge--pro">Pro 会员</span>
            ) : (
              <span className="badge badge--free">免费用户</span>
            )}
          </div>
        </div>
      </div>

      {/* 配额卡片 */}
      <div className="me-card me-quota">
        <div className="me-quota__header">
          <span className="me-quota__title">今日次数</span>
          <span className="me-quota__value">{quota.remaining} / {quota.total}</span>
        </div>
        <div className="me-quota__bar">
          <div 
            className="me-quota__progress" 
            style={{ width: `${(quota.remaining / quota.total) * 100}%` }}
          />
        </div>
        {!isPro && (
          <button 
            className="me-quota__upgrade"
            onClick={() => router.push('/paywall')}
          >
            升级 Pro 获取更多次数 →
          </button>
        )}
      </div>

      {/* 钱包卡片 */}
      <div className="me-card me-wallet">
        <div className="me-wallet__icon">💎</div>
        <div className="me-wallet__info">
          <span className="me-wallet__label">金币余额</span>
          <span className="me-wallet__balance">{billing.getCoinsBalance()}</span>
        </div>
        <button 
          className="btn btn--secondary"
          onClick={() => router.push('/paywall')}
        >
          充值
        </button>
      </div>

      {/* 订阅状态 */}
      {subscription && (
        <div className="me-card me-subscription">
          <div className="me-subscription__header">
            <span className="me-subscription__title">Pro 会员</span>
            <span className={`me-subscription__status me-subscription__status--${subscription.status}`}>
              {subscription.status === 'active' ? '生效中' : subscription.status}
            </span>
          </div>
          <div className="me-subscription__info">
            <span>到期时间</span>
            <span>{new Date(subscription.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* 菜单 */}
      <div className="me-menu">
        <button className="me-menu__item" onClick={() => router.push('/settings')}>
          <span className="me-menu__icon">⚙️</span>
          <span className="me-menu__label">设置</span>
          <span className="me-menu__arrow">→</span>
        </button>
        <button className="me-menu__item" onClick={() => router.push('/library')}>
          <span className="me-menu__icon">📚</span>
          <span className="me-menu__label">我的作品</span>
          <span className="me-menu__arrow">→</span>
        </button>
        <button className="me-menu__item" onClick={() => router.push('/paywall')}>
          <span className="me-menu__icon">👑</span>
          <span className="me-menu__label">会员中心</span>
          <span className="me-menu__arrow">→</span>
        </button>
      </div>

      {/* 登出 */}
      <button className="me-logout" onClick={handleLogout}>
        退出登录
      </button>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .me-page {
    padding: 24px;
    max-width: 500px;
  }

  /* Guest state */
  .me-guest {
    text-align: center;
    padding: 48px 24px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
  }
  .me-guest__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin: 0 auto 16px;
  }
  .me-guest h1 {
    margin: 0 0 8px;
  }
  .me-guest p {
    color: var(--color-text-muted);
    margin: 0 0 24px;
  }
  .me-features {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 24px;
  }
  .me-features h3 {
    margin: 0 0 16px;
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .me-features__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .me-feature {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .me-feature__icon {
    font-size: 20px;
  }

  /* Card */
  .me-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 20px;
    margin-bottom: 16px;
  }

  /* Profile */
  .me-profile {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .me-profile__avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    overflow: hidden;
    flex-shrink: 0;
  }
  .me-profile__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .me-profile__info h2 {
    margin: 0 0 4px;
    font-size: 18px;
  }
  .me-profile__info p {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge--pro {
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: white;
  }
  .badge--free {
    background: var(--color-border);
    color: var(--color-text-muted);
  }

  /* Quota */
  .me-quota__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .me-quota__title {
    color: var(--color-text-muted);
  }
  .me-quota__value {
    font-weight: 600;
  }
  .me-quota__bar {
    height: 8px;
    background: var(--color-border);
    border-radius: 4px;
    overflow: hidden;
  }
  .me-quota__progress {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), #8b5cf6);
    border-radius: 4px;
    transition: width 0.3s;
  }
  .me-quota__upgrade {
    display: block;
    width: 100%;
    margin-top: 16px;
    padding: 12px;
    background: none;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-primary);
    cursor: pointer;
    text-align: center;
  }
  .me-quota__upgrade:hover {
    border-color: var(--color-primary);
    background: rgba(99, 102, 241, 0.05);
  }

  /* Wallet */
  .me-wallet {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .me-wallet__icon {
    font-size: 32px;
  }
  .me-wallet__info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .me-wallet__label {
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .me-wallet__balance {
    font-size: 24px;
    font-weight: 700;
  }

  /* Subscription */
  .me-subscription__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .me-subscription__title {
    font-weight: 600;
  }
  .me-subscription__status {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
  }
  .me-subscription__status--active {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  .me-subscription__info {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--color-text-muted);
  }

  /* Menu */
  .me-menu {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: 24px;
  }
  .me-menu__item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 16px 20px;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
  }
  .me-menu__item:last-child {
    border-bottom: none;
  }
  .me-menu__item:hover {
    background: rgba(99, 102, 241, 0.05);
  }
  .me-menu__icon {
    font-size: 20px;
  }
  .me-menu__label {
    flex: 1;
  }
  .me-menu__arrow {
    color: var(--color-text-muted);
  }

  /* Logout */
  .me-logout {
    display: block;
    width: 100%;
    padding: 14px;
    background: none;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-md);
    color: #ef4444;
    cursor: pointer;
    font-size: 16px;
  }
  .me-logout:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .btn--primary {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 14px 28px;
    font-size: 16px;
    font-weight: 600;
  }
  .btn--secondary {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 10px 16px;
  }
`;
