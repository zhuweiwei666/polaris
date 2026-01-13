'use client';

import { useState } from 'react';
import type { Tool } from '../types';

interface CreateFormProps {
  tool: Tool;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

export function CreateForm({ tool, onSubmit, loading }: CreateFormProps) {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    await onSubmit({ prompt: input });
  };

  return (
    <form className="ai-create-form" onSubmit={handleSubmit}>
      <div className="ai-create-form__header">
        <h2>{tool.title}</h2>
        <p className="ai-create-form__desc">{tool.description}</p>
      </div>

      <div className="ai-create-form__input-group">
        <textarea
          className="ai-create-form__input"
          placeholder="输入你的需求..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="ai-create-form__submit"
        disabled={!input.trim() || loading}
      >
        {loading ? '生成中...' : '开始生成'}
      </button>

      <style>{`
        .ai-create-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ai-create-form__header h2 {
          margin: 0 0 4px;
        }
        .ai-create-form__desc {
          color: var(--color-text-muted);
          margin: 0;
        }
        .ai-create-form__input {
          width: 100%;
          padding: 12px;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text);
          font-size: 16px;
          resize: vertical;
        }
        .ai-create-form__input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .ai-create-form__submit {
          padding: 12px 24px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .ai-create-form__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
