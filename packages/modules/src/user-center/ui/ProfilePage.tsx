'use client';

import { useAuth, useUser, useBilling, useSubscription } from '@polaris/core';

interface ProfilePageProps {
  onNavigateSettings?: () => void;
  onNavigateOrders?: () => void;
}

export function ProfilePage({ onNavigateSettings, onNavigateOrders }: ProfilePageProps) {
  const auth = useAuth();
  const user = useUser();
  const billing = useBilling();
  const subscription = useSubscription();

  const handleLogin = async () => {
    await auth.requireLogin();
  };

  const handleLogout = async () => {
    await auth.logout();
  };

  if (!user) {
    return (
      <div className="uc-profile">
        <div className="uc-profile__guest">
          <div className="uc-profile__avatar uc-profile__avatar--guest">👤</div>
          <h2>未登录</h2>
          <p>登录后可同步数据、解锁更多功能</p>
          <button className="uc-profile__login-btn" onClick={handleLogin}>
            登录 / 注册
          </button>
        </div>

        <style>{profileStyles}</style>
      </div>
    );
  }

  return (
    <div className="uc-profile">
      <div className="uc-profile__header">
        <div className="uc-profile__avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} />
          ) : (
            user.displayName?.charAt(0) || '👤'
          )}
        </div>
        <div className="uc-profile__info">
          <h2>{user.displayName || '用户'}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="uc-profile__section">
        <h3>会员状态</h3>
        {subscription?.status === 'active' ? (
          <div className="uc-profile__subscription uc-profile__subscription--active">
            <span className="uc-profile__plan">Pro 会员</span>
            <span className="uc-profile__expires">
              到期时间: {new Date(subscription.expiresAt).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <div className="uc-profile__subscription uc-profile__subscription--free">
            <span className="uc-profile__plan">免费用户</span>
            <button className="uc-profile__upgrade-btn">升级 Pro</button>
          </div>
        )}
      </div>

      <div className="uc-profile__section">
        <h3>钱包</h3>
        <div className="uc-profile__wallet">
          <span className="uc-profile__coins">💎 {billing.getCoinsBalance()} 金币</span>
        </div>
      </div>

      <div className="uc-profile__actions">
        {onNavigateSettings && (
          <button className="uc-profile__action" onClick={onNavigateSettings}>
            ⚙️ 设置
          </button>
        )}
        {onNavigateOrders && (
          <button className="uc-profile__action" onClick={onNavigateOrders}>
            📋 订单历史
          </button>
        )}
        <button className="uc-profile__action uc-profile__action--danger" onClick={handleLogout}>
          退出登录
        </button>
      </div>

      <style>{profileStyles}</style>
    </div>
  );
}

const profileStyles = `
  .uc-profile {
    padding: 24px;
    max-width: 500px;
  }
  .uc-profile__guest {
    text-align: center;
    padding: 48px 24px;
  }
  .uc-profile__guest h2 {
    margin: 16px 0 8px;
  }
  .uc-profile__guest p {
    color: var(--color-text-muted);
    margin: 0 0 24px;
  }
  .uc-profile__header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }
  .uc-profile__avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    overflow: hidden;
  }
  .uc-profile__avatar--guest {
    background: var(--color-border);
  }
  .uc-profile__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .uc-profile__info h2 {
    margin: 0;
  }
  .uc-profile__info p {
    margin: 4px 0 0;
    color: var(--color-text-muted);
  }
  .uc-profile__section {
    margin-bottom: 24px;
    padding: 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }
  .uc-profile__section h3 {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .uc-profile__subscription {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .uc-profile__plan {
    font-weight: 600;
  }
  .uc-profile__subscription--active .uc-profile__plan {
    color: var(--color-primary);
  }
  .uc-profile__expires {
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .uc-profile__upgrade-btn,
  .uc-profile__login-btn {
    padding: 10px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  .uc-profile__wallet {
    font-size: 18px;
  }
  .uc-profile__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .uc-profile__action {
    padding: 12px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
  }
  .uc-profile__action:hover {
    border-color: var(--color-primary);
  }
  .uc-profile__action--danger {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
  }
`;
