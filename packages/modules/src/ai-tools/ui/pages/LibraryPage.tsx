'use client';

import { useTaskList } from '../../state/useAiTools';
import { TaskResult } from '../TaskResult';

export function LibraryPage() {
  const { tasks, loading, reload } = useTaskList();

  if (loading) {
    return (
      <div className="ai-library-page">
        <div className="ai-library-page__loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="ai-library-page">
      <div className="ai-library-page__header">
        <h1>我的作品</h1>
        <button className="ai-library-page__refresh" onClick={reload}>
          刷新
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="ai-library-page__empty">
          暂无作品，去创作一个吧
        </div>
      ) : (
        <div className="ai-library-page__list">
          {tasks.map((task) => (
            <TaskResult key={task.taskId} task={task} />
          ))}
        </div>
      )}

      <style>{`
        .ai-library-page {
          padding: 24px;
        }
        .ai-library-page__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .ai-library-page__header h1 {
          margin: 0;
        }
        .ai-library-page__refresh {
          padding: 8px 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text);
          cursor: pointer;
        }
        .ai-library-page__list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ai-library-page__empty,
        .ai-library-page__loading {
          padding: 48px;
          text-align: center;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
