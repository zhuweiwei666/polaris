'use client';

import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@polaris/core';

export default function SettingsPage() {
  const router = useRouter();
  const user = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.logout();
    router.push('/');
  };

  const menuItems = [
    { id: 'account', icon: '👤', label: '账号与安全', desc: '管理账号信息' },
    { id: 'notification', icon: '🔔', label: '通知设置', desc: '推送和提醒' },
    { id: 'privacy', icon: '🔒', label: '隐私设置', desc: '数据和权限' },
    { id: 'language', icon: '🌐', label: '语言', desc: '简体中文', value: '简体中文' },
    { id: 'theme', icon: '🎨', label: '主题', desc: '深色模式', value: '深色' },
    { id: 'cache', icon: '🗑️', label: '清除缓存', desc: '释放存储空间' },
  ];

  const infoItems = [
    { id: 'about', icon: 'ℹ️', label: '关于我们' },
    { id: 'terms', icon: '📄', label: '服务条款' },
    { id: 'privacy-policy', icon: '🔐', label: '隐私政策' },
    { id: 'feedback', icon: '💬', label: '意见反馈' },
  ];

  return (
    <div className="settings">
      <h1>设置</h1>

      {/* 用户信息 */}
      {user ? (
        <div className="settings__user" onClick={() => router.push('/me')}>
          <div className="settings__user-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} />
            ) : (
              <span>{user.displayName?.charAt(0) || user.email?.charAt(0) || '👤'}</span>
            )}
          </div>
          <div className="settings__user-info">
            <span className="settings__user-name">{user.displayName || '用户'}</span>
            <span className="settings__user-email">{user.email || 'No email'}</span>
          </div>
          <span className="settings__user-arrow">→</span>
        </div>
      ) : (
        <div className="settings__login-prompt" onClick={() => auth.requireLogin().catch(() => {})}>
          <span className="settings__login-icon">👤</span>
          <span>点击登录账号</span>
          <span className="settings__login-arrow">→</span>
        </div>
      )}

      {/* 设置菜单 */}
      <div className="settings__section">
        <h3>通用设置</h3>
        <div className="settings__menu">
          {menuItems.map((item) => (
            <button key={item.id} className="settings__menu-item">
              <span className="settings__menu-icon">{item.icon}</span>
              <div className="settings__menu-info">
                <span className="settings__menu-label">{item.label}</span>
                <span className="settings__menu-desc">{item.desc}</span>
              </div>
              {item.value && (
                <span className="settings__menu-value">{item.value}</span>
              )}
              <span className="settings__menu-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* 信息 */}
      <div className="settings__section">
        <h3>关于</h3>
        <div className="settings__menu">
          {infoItems.map((item) => (
            <button key={item.id} className="settings__menu-item">
              <span className="settings__menu-icon">{item.icon}</span>
              <span className="settings__menu-label">{item.label}</span>
              <span className="settings__menu-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* 版本信息 */}
      <div className="settings__version">
        <span>Version 1.0.0</span>
      </div>

      {/* 登出 */}
      {user && (
        <button className="settings__logout" onClick={handleLogout}>
          退出登录
        </button>
      )}

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .settings {
    padding: 24px;
    max-width: 600px;
  }
  .settings h1 {
    margin: 0 0 24px;
  }

  /* User */
  .settings__user {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .settings__user:hover {
    border-color: var(--color-primary);
  }
  .settings__user-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    overflow: hidden;
    flex-shrink: 0;
  }
  .settings__user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .settings__user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .settings__user-name {
    font-weight: 600;
    font-size: 16px;
  }
  .settings__user-email {
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .settings__user-arrow {
    color: var(--color-text-muted);
    font-size: 18px;
  }

  /* Login prompt */
  .settings__login-prompt {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: all 0.2s;
  }
  .settings__login-prompt:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
  .settings__login-icon {
    font-size: 24px;
  }
  .settings__login-arrow {
    margin-left: auto;
  }

  /* Section */
  .settings__section {
    margin-bottom: 24px;
  }
  .settings__section h3 {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--color-text-muted);
    padding-left: 4px;
  }

  /* Menu */
  .settings__menu {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .settings__menu-item {
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
    transition: background 0.2s;
  }
  .settings__menu-item:last-child {
    border-bottom: none;
  }
  .settings__menu-item:hover {
    background: rgba(99, 102, 241, 0.05);
  }
  .settings__menu-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
  .settings__menu-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .settings__menu-label {
    font-size: 15px;
  }
  .settings__menu-desc {
    font-size: 13px;
    color: var(--color-text-muted);
  }
  .settings__menu-value {
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .settings__menu-arrow {
    color: var(--color-text-muted);
  }

  /* Version */
  .settings__version {
    text-align: center;
    padding: 24px;
    font-size: 14px;
    color: var(--color-text-muted);
  }

  /* Logout */
  .settings__logout {
    display: block;
    width: 100%;
    padding: 14px;
    background: none;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-md);
    color: #ef4444;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;
  }
  .settings__logout:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;
