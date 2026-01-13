'use client';

import { useCallback, useState } from 'react';
import { useAuth, useEntitlement, useQuota } from '@polaris/core';
import { useAiTools, useTask } from '../../state/useAiTools';
import { CreateForm } from '../CreateForm';
import { TaskResult } from '../TaskResult';
import type { Tool } from '../../types';

interface CreatePageProps {
  toolId: string;
  onBack?: () => void;
}

export function CreatePage({ toolId, onBack }: CreatePageProps) {
  const { tools, createTask } = useAiTools();
  const auth = useAuth();
  const entitlement = useEntitlement();
  const quota = useQuota('daily');

  const [taskId, setTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { task } = useTask(taskId);

  const tool = tools.find((t) => t.toolId === toolId);

  const handleSubmit = useCallback(
    async (payload: Record<string, unknown>) => {
      setError(null);

      // 检查登录
      if (!auth.isAuthenticated()) {
        try {
          await auth.requireLogin();
        } catch {
          setError('请先登录');
          return;
        }
      }

      // 检查配额
      if (quota.remaining <= 0) {
        setError('今日次数已用完，请升级或明天再试');
        return;
      }

      setLoading(true);
      try {
        const newTask = await createTask(toolId, payload);
        if (newTask) {
          setTaskId(newTask.taskId);
        } else {
          setError('配额不足');
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    },
    [auth, quota, createTask, toolId]
  );

  if (!tool) {
    return (
      <div className="ai-create-page">
        <div className="ai-create-page__error">工具不存在</div>
      </div>
    );
  }

  return (
    <div className="ai-create-page">
      {onBack && (
        <button className="ai-create-page__back" onClick={onBack}>
          ← 返回
        </button>
      )}

      <div className="ai-create-page__quota">
        今日剩余: {quota.remaining} / {quota.total}
      </div>

      {!task && (
        <>
          <CreateForm tool={tool} onSubmit={handleSubmit} loading={loading} />
          {error && <div className="ai-create-page__error">{error}</div>}
        </>
      )}

      {task && <TaskResult task={task} />}

      {task?.status === 'succeeded' && (
        <button
          className="ai-create-page__again"
          onClick={() => setTaskId(null)}
        >
          再创作一个
        </button>
      )}

      <style>{`
        .ai-create-page {
          padding: 24px;
          max-width: 600px;
        }
        .ai-create-page__back {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          margin-bottom: 16px;
          padding: 0;
        }
        .ai-create-page__quota {
          padding: 8px 12px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          font-size: 14px;
          color: var(--color-text-muted);
          margin-bottom: 16px;
          display: inline-block;
        }
        .ai-create-page__error {
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-sm);
          color: #ef4444;
          margin-top: 16px;
        }
        .ai-create-page__again {
          margin-top: 16px;
          padding: 12px 24px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
