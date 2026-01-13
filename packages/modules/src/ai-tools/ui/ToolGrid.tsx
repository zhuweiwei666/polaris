'use client';

import type { Tool } from '../types';

interface ToolGridProps {
  tools: Tool[];
  onSelect: (tool: Tool) => void;
  loading?: boolean;
}

export function ToolGrid({ tools, onSelect, loading }: ToolGridProps) {
  if (loading) {
    return (
      <div className="ai-tools-grid ai-tools-grid--loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ai-tools-card ai-tools-card--skeleton" />
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="ai-tools-empty">
        <span>暂无可用工具</span>
      </div>
    );
  }

  return (
    <div className="ai-tools-grid">
      {tools.map((tool) => (
        <button
          key={tool.toolId}
          className="ai-tools-card"
          onClick={() => onSelect(tool)}
        >
          {tool.icon && <span className="ai-tools-card__icon">{tool.icon}</span>}
          <span className="ai-tools-card__title">{tool.title}</span>
          <span className="ai-tools-card__desc">{tool.description}</span>
        </button>
      ))}

      <style>{`
        .ai-tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .ai-tools-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, transform 0.15s;
        }
        .ai-tools-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }
        .ai-tools-card__icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .ai-tools-card__title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .ai-tools-card__desc {
          font-size: 14px;
          color: var(--color-text-muted);
        }
        .ai-tools-card--skeleton {
          height: 120px;
          background: linear-gradient(90deg, var(--color-surface) 0%, var(--color-border) 50%, var(--color-surface) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .ai-tools-empty {
          padding: 48px;
          text-align: center;
          color: var(--color-text-muted);
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
