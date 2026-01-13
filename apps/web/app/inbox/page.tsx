'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@polaris/core';

interface Notification {
  id: string;
  type: 'system' | 'task' | 'promo';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Mock data for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'system',
    title: '欢迎使用',
    content: '感谢你使用我们的 AI 创作工具！快开始你的第一次创作吧。',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    type: 'promo',
    title: '新用户特惠',
    content: '限时优惠：首次订阅 Pro 会员立减 30%！',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    type: 'task',
    title: '任务完成',
    content: '你的图片生成任务已完成，快去查看吧！',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export default function InboxPage() {
  const user = useUser();
  const auth = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system':
        return '📢';
      case 'task':
        return '✅';
      case 'promo':
        return '🎁';
      default:
        return '📬';
    }
  };

  const handleLogin = async () => {
    try {
      await auth.requireLogin();
    } catch {
      // 取消登录
    }
  };

  // 未登录
  if (!user) {
    return (
      <div className="inbox">
        <div className="inbox__empty">
          <span className="inbox__empty-icon">🔒</span>
          <h2>登录查看消息</h2>
          <p>登录后可接收系统通知和任务更新</p>
          <button className="inbox__login-btn" onClick={handleLogin}>
            立即登录
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="inbox">
      <div className="inbox__header">
        <h1>
          消息中心
          {unreadCount > 0 && (
            <span className="inbox__badge">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button className="inbox__mark-all" onClick={markAllAsRead}>
            全部已读
          </button>
        )}
      </div>

      {/* 筛选 */}
      <div className="inbox__filters">
        <button
          className={`inbox__filter ${filter === 'all' ? 'inbox__filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        <button
          className={`inbox__filter ${filter === 'unread' ? 'inbox__filter--active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          未读 {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* 消息列表 */}
      {filteredNotifications.length === 0 ? (
        <div className="inbox__empty inbox__empty--small">
          <span className="inbox__empty-icon">📭</span>
          <p>暂无{filter === 'unread' ? '未读' : ''}消息</p>
        </div>
      ) : (
        <div className="inbox__list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`inbox__item ${!notification.read ? 'inbox__item--unread' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="inbox__item-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="inbox__item-content">
                <div className="inbox__item-header">
                  <span className="inbox__item-title">{notification.title}</span>
                  {!notification.read && (
                    <span className="inbox__item-dot" />
                  )}
                </div>
                <p className="inbox__item-text">{notification.content}</p>
                <span className="inbox__item-time">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .inbox {
    padding: 24px;
    max-width: 600px;
  }

  /* Header */
  .inbox__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .inbox__header h1 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .inbox__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    background: #ef4444;
    color: white;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }
  .inbox__mark-all {
    padding: 8px 16px;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
  }
  .inbox__mark-all:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  /* Filters */
  .inbox__filters {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }
  .inbox__filter {
    padding: 8px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.2s;
  }
  .inbox__filter:hover {
    border-color: var(--color-primary);
  }
  .inbox__filter--active {
    background: rgba(99, 102, 241, 0.1);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  /* Empty */
  .inbox__empty {
    text-align: center;
    padding: 64px 24px;
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-lg);
  }
  .inbox__empty--small {
    padding: 48px 24px;
  }
  .inbox__empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }
  .inbox__empty h2 {
    margin: 0 0 8px;
  }
  .inbox__empty p {
    margin: 0 0 24px;
    color: var(--color-text-muted);
  }
  .inbox__login-btn {
    padding: 14px 32px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

  /* List */
  .inbox__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .inbox__item {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.2s;
  }
  .inbox__item:hover {
    border-color: var(--color-primary);
  }
  .inbox__item--unread {
    background: linear-gradient(135deg, var(--color-surface), rgba(99, 102, 241, 0.03));
  }
  .inbox__item-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: var(--color-border);
    border-radius: 50%;
    flex-shrink: 0;
  }
  .inbox__item-content {
    flex: 1;
    min-width: 0;
  }
  .inbox__item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .inbox__item-title {
    font-weight: 600;
  }
  .inbox__item-dot {
    width: 8px;
    height: 8px;
    background: var(--color-primary);
    border-radius: 50%;
  }
  .inbox__item-text {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--color-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .inbox__item-time {
    font-size: 12px;
    color: var(--color-text-muted);
  }
`;
