'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEntitlement, useUser, useConfig, useAuth } from '@polaris/core';
import type { Tool } from '@polaris/core';

export default function HomePage() {
  const router = useRouter();
  const auth = useAuth();
  const user = useUser();
  const config = useConfig();
  const entitlement = useEntitlement();
  const quota = entitlement.limit('daily');

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tools')
      .then((r) => r.json())
      .then(setTools)
      .catch(() => setTools([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToolClick = async (tool: Tool) => {
    // 检查是否需要登录
    if (!auth.isAuthenticated()) {
      try {
        await auth.requireLogin();
      } catch {
        return;
      }
    }
    router.push(`/create?tool=${tool.id}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <div className="home__hero">
        <h1>AI 创作工具</h1>
        <p>一站式 AI 生成平台，文字、图片、视频随心创作</p>
      </div>

      {/* 配额提示 */}
      <div className="home__quota">
        <div className="home__quota-bar">
          <div 
            className="home__quota-progress"
            style={{ width: `${(quota.remaining / quota.total) * 100}%` }}
          />
        </div>
        <span className="home__quota-text">
          今日剩余 {quota.remaining}/{quota.total} 次
        </span>
        {!user && (
          <button 
            className="home__quota-login"
            onClick={() => auth.requireLogin().catch(() => {})}
          >
            登录获取更多
          </button>
        )}
      </div>

      {/* 快捷入口 */}
      <div className="home__quick">
        <button className="home__quick-btn" onClick={() => router.push('/create')}>
          <span className="home__quick-icon">✨</span>
          <span>新建创作</span>
        </button>
        <button className="home__quick-btn" onClick={() => router.push('/library')}>
          <span className="home__quick-icon">📚</span>
          <span>我的作品</span>
        </button>
      </div>

      {/* 工具网格 */}
      <div className="home__section">
        <div className="home__section-header">
          <h2>AI 工具</h2>
          <span className="home__section-count">{tools.length} 个工具</span>
        </div>

        {loading ? (
          <div className="home__loading">
            <div className="home__spinner" />
            <span>加载中...</span>
          </div>
        ) : tools.length === 0 ? (
          <div className="home__empty">
            <span className="home__empty-icon">🔧</span>
            <p>暂无可用工具</p>
            <p className="home__empty-hint">请确保 API 服务已启动</p>
          </div>
        ) : (
          <div className="home__tools">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className="home__tool"
                onClick={() => handleToolClick(tool)}
              >
                <div className="home__tool-icon">
                  {tool.modalityOut?.includes('video') ? '🎬' :
                   tool.modalityOut?.includes('image') ? '🎨' :
                   tool.modalityOut?.includes('audio') ? '🎵' : '✨'}
                </div>
                <div className="home__tool-info">
                  <span className="home__tool-title">{tool.title}</span>
                  <span className="home__tool-desc">{tool.description}</span>
                </div>
                <div className="home__tool-tags">
                  {tool.modalityIn?.map((m) => (
                    <span key={m} className="home__tool-tag">{m}</span>
                  ))}
                  <span className="home__tool-arrow">→</span>
                  {tool.modalityOut?.map((m) => (
                    <span key={m} className="home__tool-tag home__tool-tag--out">{m}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feature Flags 调试 (仅开发环境) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="home__debug">
          <h3>🔧 Debug: Feature Flags</h3>
          <div className="home__debug-flags">
            <span className="home__debug-flag">
              enableVideo: {config.getFlag('enableVideo') ? '✓' : '✗'}
            </span>
            <span className="home__debug-flag">
              enableImage: {config.getFlag('enableImage') ? '✓' : '✗'}
            </span>
            <span className="home__debug-flag">
              freeDailyRequests: {config.getParam('freeDailyRequests', 5)}
            </span>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .home {
    padding: 24px;
    max-width: 800px;
  }

  /* Hero */
  .home__hero {
    text-align: center;
    margin-bottom: 32px;
  }
  .home__hero h1 {
    margin: 0 0 8px;
    font-size: 32px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .home__hero p {
    margin: 0;
    color: var(--color-text-muted);
  }

  /* Quota */
  .home__quota {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
  }
  .home__quota-bar {
    flex: 1;
    height: 8px;
    background: var(--color-border);
    border-radius: 4px;
    overflow: hidden;
  }
  .home__quota-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), #8b5cf6);
    border-radius: 4px;
    transition: width 0.3s;
  }
  .home__quota-text {
    font-size: 14px;
    color: var(--color-text-muted);
    white-space: nowrap;
  }
  .home__quota-login {
    padding: 8px 16px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }

  /* Quick */
  .home__quick {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .home__quick-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px;
    background: linear-gradient(135deg, var(--color-surface), rgba(99, 102, 241, 0.05));
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
    cursor: pointer;
    transition: all 0.2s;
  }
  .home__quick-btn:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }
  .home__quick-icon {
    font-size: 24px;
  }

  /* Section */
  .home__section {
    margin-bottom: 32px;
  }
  .home__section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .home__section-header h2 {
    margin: 0;
    font-size: 20px;
  }
  .home__section-count {
    font-size: 14px;
    color: var(--color-text-muted);
  }

  /* Loading */
  .home__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px;
    color: var(--color-text-muted);
  }
  .home__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Empty */
  .home__empty {
    text-align: center;
    padding: 48px;
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-lg);
  }
  .home__empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }
  .home__empty p {
    margin: 0;
  }
  .home__empty-hint {
    margin-top: 8px;
    font-size: 14px;
    color: var(--color-text-muted);
  }

  /* Tools */
  .home__tools {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .home__tool {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }
  .home__tool:hover {
    border-color: var(--color-primary);
    transform: translateX(4px);
  }
  .home__tool-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }
  .home__tool-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .home__tool-title {
    font-weight: 600;
    font-size: 16px;
  }
  .home__tool-desc {
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .home__tool-tags {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }
  .home__tool-tag {
    padding: 4px 8px;
    background: var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
  }
  .home__tool-tag--out {
    background: rgba(99, 102, 241, 0.2);
    color: var(--color-primary);
  }
  .home__tool-arrow {
    color: var(--color-text-muted);
  }

  /* Debug */
  .home__debug {
    margin-top: 32px;
    padding: 16px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px dashed rgba(245, 158, 11, 0.5);
    border-radius: var(--radius-md);
  }
  .home__debug h3 {
    margin: 0 0 12px;
    font-size: 14px;
    color: #f59e0b;
  }
  .home__debug-flags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .home__debug-flag {
    padding: 4px 10px;
    background: var(--color-surface);
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-family: monospace;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
