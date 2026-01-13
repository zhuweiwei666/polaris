'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useAnalytics } from '@polaris/core';

interface AiTask {
  id: string;
  toolId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';
  createdAt: string;
  artifacts?: Array<{ id: string; type: string; objectKey: string }>;
}

export default function LibraryPage() {
  const router = useRouter();
  const auth = useAuth();
  const user = useUser();
  const analytics = useAnalytics();

  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'running' | 'failed'>('all');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch('/api/ai-tasks')
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.items || []);
        analytics.track('library_viewed', { count: data.items?.length || 0 });
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [user, analytics]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleLogin = async () => {
    try {
      await auth.requireLogin();
    } catch {
      // 用户取消
    }
  };

  const handleTaskClick = (task: AiTask) => {
    router.push(`/tasks/${task.id}`);
    analytics.track('task_opened', { taskId: task.id, from: 'library' });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; bg: string; label: string }> = {
      queued: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: '排队中' },
      running: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', label: '处理中' },
      succeeded: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: '完成' },
      failed: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: '失败' },
      canceled: { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)', label: '已取消' }
    };
    const c = config[status] || config.queued;
    return (
      <span
        className="library__task-status"
        style={{ color: c.color, background: c.bg }}
      >
        {c.label}
      </span>
    );
  };

  const getToolIcon = (toolId: string) => {
    if (toolId.includes('video')) return '🎬';
    if (toolId.includes('image')) return '🎨';
    if (toolId.includes('audio')) return '🎵';
    return '✨';
  };

  // 未登录
  if (!user) {
    return (
      <div className="library">
        <div className="library__empty">
          <span className="library__empty-icon">🔒</span>
          <h2>登录查看作品</h2>
          <p>登录后可查看你的所有创作历史</p>
          <button className="library__login-btn" onClick={handleLogin}>
            立即登录
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="library">
      <div className="library__header">
        <h1>我的作品</h1>
        <button 
          className="library__create-btn"
          onClick={() => router.push('/create')}
        >
          ✨ 新建
        </button>
      </div>

      {/* 筛选器 */}
      <div className="library__filters">
        {(['all', 'succeeded', 'running', 'failed'] as const).map((f) => (
          <button
            key={f}
            className={`library__filter ${filter === f ? 'library__filter--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : f === 'succeeded' ? '已完成' : f === 'running' ? '进行中' : '失败'}
          </button>
        ))}
      </div>

      {/* 加载中 */}
      {loading && (
        <div className="library__loading">
          <div className="library__spinner" />
          <span>加载中...</span>
        </div>
      )}

      {/* 空状态 */}
      {!loading && filteredTasks.length === 0 && (
        <div className="library__empty">
          <span className="library__empty-icon">📭</span>
          <h2>暂无作品</h2>
          <p>开始创作你的第一个作品吧</p>
          <button 
            className="library__create-btn"
            onClick={() => router.push('/create')}
          >
            ✨ 开始创作
          </button>
        </div>
      )}

      {/* 任务列表 */}
      {!loading && filteredTasks.length > 0 && (
        <div className="library__tasks">
          {filteredTasks.map((task) => (
            <button
              key={task.id}
              className="library__task"
              onClick={() => handleTaskClick(task)}
            >
              <div className="library__task-icon">
                {getToolIcon(task.toolId)}
              </div>
              <div className="library__task-info">
                <span className="library__task-title">{task.toolId}</span>
                <span className="library__task-time">
                  {new Date(task.createdAt).toLocaleString()}
                </span>
              </div>
              {getStatusBadge(task.status)}
              <span className="library__task-arrow">→</span>
            </button>
          ))}
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .library {
    padding: 24px;
    max-width: 800px;
  }

  /* Header */
  .library__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .library__header h1 {
    margin: 0;
  }
  .library__create-btn {
    padding: 10px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
  }

  /* Filters */
  .library__filters {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }
  .library__filter {
    padding: 8px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.2s;
  }
  .library__filter:hover {
    border-color: var(--color-primary);
  }
  .library__filter--active {
    background: rgba(99, 102, 241, 0.1);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  /* Loading */
  .library__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px;
    color: var(--color-text-muted);
  }
  .library__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Empty */
  .library__empty {
    text-align: center;
    padding: 64px 24px;
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-lg);
  }
  .library__empty-icon {
    font-size: 64px;
    display: block;
    margin-bottom: 16px;
  }
  .library__empty h2 {
    margin: 0 0 8px;
  }
  .library__empty p {
    margin: 0 0 24px;
    color: var(--color-text-muted);
  }
  .library__login-btn {
    padding: 14px 32px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

  /* Tasks */
  .library__tasks {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .library__task {
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
    color: var(--color-text);
  }
  .library__task:hover {
    border-color: var(--color-primary);
    transform: translateX(4px);
  }
  .library__task-icon {
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
  .library__task-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .library__task-title {
    font-weight: 600;
  }
  .library__task-time {
    font-size: 13px;
    color: var(--color-text-muted);
  }
  .library__task-status {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }
  .library__task-arrow {
    color: var(--color-text-muted);
    font-size: 18px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
