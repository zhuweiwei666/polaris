export interface Tool {
  toolId: string;
  title: string;
  description: string;
  modalityIn?: string[];
  modalityOut?: string[];
  schema?: Record<string, unknown>;
  icon?: string;
}

export interface AiTask {
  taskId: string;
  toolId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';
  payload: Record<string, unknown>;
  artifacts: AiArtifact[];
  error?: { code: string; message: string };
  createdAt: string;
  updatedAt: string;
}

export interface AiArtifact {
  artifactId: string;
  type: 'text' | 'image' | 'video' | 'file';
  objectKey: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTaskDto {
  toolId: string;
  payload: Record<string, unknown>;
}

export interface AiToolsConfig {
  /** 默认显示的工具 ID 列表 */
  featuredTools?: string[];
  /** 是否显示最近任务 */
  showRecentTasks?: boolean;
  /** 最大轮询次数 */
  maxPollingAttempts?: number;
}

export interface AiToolsEvents {
  'ai_tools.tool_clicked': {
    description: '用户点击工具';
    properties: {
      toolId: 'string';
    };
  };
  'ai_tools.task_created': {
    description: '任务创建成功';
    properties: {
      toolId: 'string';
      taskId: 'string';
    };
  };
  'ai_tools.task_completed': {
    description: '任务完成';
    properties: {
      toolId: 'string';
      taskId: 'string';
      status: 'string';
    };
  };
}
