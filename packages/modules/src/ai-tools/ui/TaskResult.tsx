'use client';

import type { AiTask } from '../types';

interface TaskResultProps {
  task: AiTask;
}

const statusLabels: Record<AiTask['status'], string> = {
  queued: '排队中',
  running: '生成中',
  succeeded: '已完成',
  failed: '失败',
  canceled: '已取消'
};

const statusColors: Record<AiTask['status'], string> = {
  queued: '#f59e0b',
  running: '#3b82f6',
  succeeded: '#22c55e',
  failed: '#ef4444',
  canceled: '#6b7280'
};

export function TaskResult({ task }: TaskResultProps) {
  const isProcessing = task.status === 'queued' || task.status === 'running';

  return (
    <div className="ai-task-result">
      <div className="ai-task-result__header">
        <span
          className="ai-task-result__status"
          style={{ background: statusColors[task.status] }}
        >
          {statusLabels[task.status]}
        </span>
        <span className="ai-task-result__time">
          {new Date(task.createdAt).toLocaleString()}
        </span>
      </div>

      {isProcessing && (
        <div className="ai-task-result__loading">
          <div className="ai-task-result__spinner" />
          <span>正在生成，请稍候...</span>
        </div>
      )}

      {task.status === 'failed' && task.error && (
        <div className="ai-task-result__error">
          <strong>错误:</strong> {task.error.message}
        </div>
      )}

      {task.status === 'succeeded' && task.artifacts.length > 0 && (
        <div className="ai-task-result__artifacts">
          {task.artifacts.map((artifact) => (
            <div key={artifact.artifactId} className="ai-task-result__artifact">
              {artifact.type === 'text' && (
                <pre className="ai-task-result__text">
                  {(artifact.metadata as any)?.content || artifact.objectKey}
                </pre>
              )}
              {artifact.type === 'image' && (
                <img
                  src={artifact.objectKey}
                  alt="Generated"
                  className="ai-task-result__image"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .ai-task-result {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 16px;
        }
        .ai-task-result__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .ai-task-result__status {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }
        .ai-task-result__time {
          color: var(--color-text-muted);
          font-size: 14px;
        }
        .ai-task-result__loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px;
          justify-content: center;
          color: var(--color-text-muted);
        }
        .ai-task-result__spinner {
          width: 24px;
          height: 24px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .ai-task-result__error {
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-sm);
          color: #ef4444;
        }
        .ai-task-result__text {
          margin: 0;
          padding: 16px;
          background: var(--color-background);
          border-radius: var(--radius-sm);
          white-space: pre-wrap;
          word-break: break-word;
          font-family: inherit;
        }
        .ai-task-result__image {
          max-width: 100%;
          border-radius: var(--radius-sm);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
