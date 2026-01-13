'use client';

import { useState } from 'react';
import { useAnalytics } from '@polaris/core';
import type { SettingsItem } from '../types';

interface SettingsPageProps {
  items?: SettingsItem[];
  onBack?: () => void;
}

const defaultItems: SettingsItem[] = [
  { id: 'notifications', label: '推送通知', type: 'toggle', value: true },
  { id: 'language', label: '语言', type: 'link', href: '/settings/language' },
  { id: 'privacy', label: '隐私政策', type: 'link', href: '/privacy' },
  { id: 'terms', label: '服务条款', type: 'link', href: '/terms' },
  { id: 'feedback', label: '意见反馈', type: 'link', href: '/feedback' }
];

export function SettingsPage({ items = defaultItems, onBack }: SettingsPageProps) {
  const analytics = useAnalytics();
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.type === 'toggle' && item.value !== undefined) {
        initial[item.id] = item.value;
      }
    });
    return initial;
  });

  const handleToggle = (id: string) => {
    setSettings((prev) => {
      const newValue = !prev[id];
      analytics.track('user_center.settings_changed', { settingId: id, value: String(newValue) });
      return { ...prev, [id]: newValue };
    });
  };

  return (
    <div className="uc-settings">
      {onBack && (
        <button className="uc-settings__back" onClick={onBack}>
          ← 返回
        </button>
      )}

      <h1>设置</h1>

      <div className="uc-settings__list">
        {items.map((item) => (
          <div key={item.id} className="uc-settings__item">
            {item.type === 'link' && (
              <a href={item.href} className="uc-settings__link">
                <span>{item.label}</span>
                <span className="uc-settings__arrow">→</span>
              </a>
            )}
            {item.type === 'toggle' && (
              <label className="uc-settings__toggle">
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={settings[item.id] ?? false}
                  onChange={() => handleToggle(item.id)}
                />
                <span className="uc-settings__switch" />
              </label>
            )}
            {item.type === 'action' && (
              <button className="uc-settings__action" onClick={item.onAction}>
                {item.label}
              </button>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .uc-settings {
          padding: 24px;
          max-width: 500px;
        }
        .uc-settings__back {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          margin-bottom: 16px;
          padding: 0;
        }
        .uc-settings h1 {
          margin: 0 0 24px;
        }
        .uc-settings__list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .uc-settings__item {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }
        .uc-settings__link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          color: var(--color-text);
          text-decoration: none;
        }
        .uc-settings__link:hover {
          background: var(--color-border);
        }
        .uc-settings__arrow {
          color: var(--color-text-muted);
        }
        .uc-settings__toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          cursor: pointer;
        }
        .uc-settings__toggle input {
          display: none;
        }
        .uc-settings__switch {
          width: 48px;
          height: 28px;
          background: var(--color-border);
          border-radius: 14px;
          position: relative;
          transition: background 0.2s;
        }
        .uc-settings__switch::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: transform 0.2s;
        }
        .uc-settings__toggle input:checked + .uc-settings__switch {
          background: var(--color-primary);
        }
        .uc-settings__toggle input:checked + .uc-settings__switch::after {
          transform: translateX(20px);
        }
        .uc-settings__action {
          width: 100%;
          padding: 16px;
          background: none;
          border: none;
          color: var(--color-text);
          cursor: pointer;
          text-align: left;
        }
        .uc-settings__action:hover {
          background: var(--color-border);
        }
      `}</style>
    </div>
  );
}
