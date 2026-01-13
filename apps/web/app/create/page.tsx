'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, useEntitlement, useAnalytics } from '@polaris/core';
import type { Tool } from '@polaris/core';

function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const entitlement = useEntitlement();
  const analytics = useAnalytics();
  const quota = entitlement.limit('daily');

  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const toolId = searchParams.get('tool');

  // 加载工具列表
  useEffect(() => {
    fetch('/api/tools')
      .then((r) => r.json())
      .then((data) => {
        setTools(data);
        if (toolId) {
          const found = data.find((t: Tool) => t.id === toolId);
          if (found) setSelectedTool(found);
        }
      })
      .finally(() => setLoading(false));
  }, [toolId]);

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setFormData({});
    setResult(null);
    setError(null);
    router.push(`/create?tool=${tool.id}`, { scroll: false });
    analytics.track('tool_selected', { toolId: tool.id });
  };

  const handleSubmit = async () => {
    if (!selectedTool) return;

    // 检查登录
    if (!auth.isAuthenticated()) {
      try {
        await auth.requireLogin();
      } catch {
        return;
      }
    }

    // 检查配额
    if (!entitlement.can('use_tool')) {
      setError('今日次数已用完，请明日再试或升级 Pro');
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      analytics.track('task_created', { toolId: selectedTool.id });
      
      const res = await fetch('/api/ai-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: selectedTool.id,
          payload: formData
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || '创建任务失败');
      }

      const task = await res.json();
      setResult(task);
      analytics.track('task_submitted', { toolId: selectedTool.id, taskId: task.id });
      
      // 跳转到任务详情页
      router.push(`/tasks/${task.id}`);
    } catch (err: any) {
      setError(err.message || '创建任务失败');
      analytics.track('task_failed', { toolId: selectedTool.id, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create">
        <div className="create__loading">
          <div className="create__spinner" />
          <span>加载中...</span>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="create">
      {/* 配额提示 */}
      <div className="create__quota">
        <span className="create__quota-label">今日剩余</span>
        <div className="create__quota-bar">
          <div 
            className="create__quota-progress"
            style={{ width: `${(quota.remaining / quota.total) * 100}%` }}
          />
        </div>
        <span className="create__quota-value">{quota.remaining}/{quota.total}</span>
      </div>

      <div className="create__layout">
        {/* 工具选择侧栏 */}
        <div className="create__sidebar">
          <h3>选择工具</h3>
          <div className="create__tool-list">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className={`create__tool-item ${selectedTool?.id === tool.id ? 'create__tool-item--active' : ''}`}
                onClick={() => handleToolSelect(tool)}
              >
                <span className="create__tool-icon">
                  {tool.modalityOut?.includes('video') ? '🎬' :
                   tool.modalityOut?.includes('image') ? '🎨' : '✨'}
                </span>
                <span className="create__tool-name">{tool.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 主内容区 */}
        <div className="create__main">
          {!selectedTool ? (
            <div className="create__empty">
              <span className="create__empty-icon">👈</span>
              <p>请先选择一个工具</p>
            </div>
          ) : (
            <div className="create__form">
              <div className="create__form-header">
                <h2>{selectedTool.title}</h2>
                <p>{selectedTool.description}</p>
              </div>

              {/* 动态表单 - 基于 tool.schema */}
              <div className="create__form-fields">
                {selectedTool.schema?.properties && 
                  Object.entries(selectedTool.schema.properties).map(([key, prop]: [string, any]) => (
                    <div key={key} className="create__field">
                      <label className="create__field-label">
                        {prop.title || key}
                        {selectedTool.schema?.required?.includes(key) && (
                          <span className="create__field-required">*</span>
                        )}
                      </label>
                      {prop.type === 'string' && prop.enum ? (
                        <select
                          className="create__field-select"
                          value={formData[key] || ''}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        >
                          <option value="">请选择</option>
                          {prop.enum.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : prop.type === 'string' ? (
                        prop.maxLength && prop.maxLength > 100 ? (
                          <textarea
                            className="create__field-textarea"
                            placeholder={prop.description || `请输入${prop.title || key}`}
                            value={formData[key] || ''}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            rows={4}
                          />
                        ) : (
                          <input
                            className="create__field-input"
                            type="text"
                            placeholder={prop.description || `请输入${prop.title || key}`}
                            value={formData[key] || ''}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          />
                        )
                      ) : prop.type === 'number' ? (
                        <input
                          className="create__field-input"
                          type="number"
                          placeholder={prop.description || `请输入${prop.title || key}`}
                          value={formData[key] || ''}
                          onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                        />
                      ) : null}
                      {prop.description && (
                        <span className="create__field-hint">{prop.description}</span>
                      )}
                    </div>
                  ))}
              </div>

              {error && (
                <div className="create__error">{error}</div>
              )}

              <button
                className="create__submit"
                onClick={handleSubmit}
                disabled={submitting || quota.remaining <= 0}
              >
                {submitting ? (
                  <>
                    <span className="create__submit-spinner" />
                    生成中...
                  </>
                ) : quota.remaining <= 0 ? (
                  '今日次数已用完'
                ) : (
                  <>
                    ✨ 开始生成
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="create__loading">加载中...</div>}>
      <CreateContent />
    </Suspense>
  );
}

const styles = `
  .create {
    padding: 24px;
    height: 100%;
  }

  /* Quota */
  .create__quota {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    margin-bottom: 24px;
  }
  .create__quota-label {
    font-size: 14px;
    color: var(--color-text-muted);
    white-space: nowrap;
  }
  .create__quota-bar {
    flex: 1;
    height: 6px;
    background: var(--color-border);
    border-radius: 3px;
    overflow: hidden;
  }
  .create__quota-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), #8b5cf6);
    border-radius: 3px;
    transition: width 0.3s;
  }
  .create__quota-value {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }

  /* Layout */
  .create__layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
    height: calc(100vh - 200px);
  }

  /* Sidebar */
  .create__sidebar {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 16px;
    overflow-y: auto;
  }
  .create__sidebar h3 {
    margin: 0 0 16px;
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .create__tool-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .create__tool-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: left;
    color: var(--color-text);
    transition: all 0.2s;
  }
  .create__tool-item:hover {
    background: rgba(99, 102, 241, 0.05);
  }
  .create__tool-item--active {
    background: rgba(99, 102, 241, 0.1);
    border-color: var(--color-primary);
  }
  .create__tool-icon {
    font-size: 20px;
  }
  .create__tool-name {
    font-size: 14px;
    font-weight: 500;
  }

  /* Main */
  .create__main {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    overflow-y: auto;
  }

  /* Empty */
  .create__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text-muted);
  }
  .create__empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  /* Form */
  .create__form-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
  }
  .create__form-header h2 {
    margin: 0 0 8px;
  }
  .create__form-header p {
    margin: 0;
    color: var(--color-text-muted);
  }
  .create__form-fields {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
  }
  .create__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .create__field-label {
    font-size: 14px;
    font-weight: 500;
  }
  .create__field-required {
    color: #ef4444;
    margin-left: 4px;
  }
  .create__field-input,
  .create__field-textarea,
  .create__field-select {
    padding: 12px 16px;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-size: 16px;
    outline: none;
  }
  .create__field-input:focus,
  .create__field-textarea:focus,
  .create__field-select:focus {
    border-color: var(--color-primary);
  }
  .create__field-textarea {
    resize: vertical;
    min-height: 100px;
  }
  .create__field-hint {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  /* Error */
  .create__error {
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-md);
    color: #ef4444;
    margin-bottom: 24px;
  }

  /* Submit */
  .create__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .create__submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .create__submit-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Loading */
  .create__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 200px;
    color: var(--color-text-muted);
  }
  .create__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
