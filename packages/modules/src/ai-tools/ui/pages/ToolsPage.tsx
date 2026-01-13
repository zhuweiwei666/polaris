'use client';

import { useCallback } from 'react';
import { useAnalytics } from '@polaris/core';
import { useAiTools } from '../../state/useAiTools';
import { ToolGrid } from '../ToolGrid';
import type { Tool } from '../../types';

interface ToolsPageProps {
  onSelectTool?: (tool: Tool) => void;
}

export function ToolsPage({ onSelectTool }: ToolsPageProps) {
  const { tools, loading } = useAiTools();
  const analytics = useAnalytics();

  const handleSelect = useCallback(
    (tool: Tool) => {
      analytics.track('ai_tools.tool_clicked', { toolId: tool.toolId });
      onSelectTool?.(tool);
    },
    [analytics, onSelectTool]
  );

  return (
    <div className="ai-tools-page">
      <div className="ai-tools-page__header">
        <h1>AI 工具</h1>
        <p>选择一个工具开始创作</p>
      </div>
      <ToolGrid tools={tools} onSelect={handleSelect} loading={loading} />

      <style>{`
        .ai-tools-page {
          padding: 24px;
        }
        .ai-tools-page__header {
          margin-bottom: 24px;
        }
        .ai-tools-page__header h1 {
          margin: 0 0 8px;
        }
        .ai-tools-page__header p {
          margin: 0;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
