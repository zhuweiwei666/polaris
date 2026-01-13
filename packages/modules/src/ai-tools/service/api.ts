import type { ApiClient } from '@polaris/core';
import type { Tool, AiTask, CreateTaskDto } from '../types';

export function createAiToolsApi(api: ApiClient) {
  return {
    /** 获取工具列表 */
    async listTools(): Promise<Tool[]> {
      return api.get<Tool[]>('/tools');
    },

    /** 获取单个工具 */
    async getTool(toolId: string): Promise<Tool | null> {
      try {
        return await api.get<Tool>(`/tools/${toolId}`);
      } catch {
        return null;
      }
    },

    /** 创建任务 */
    async createTask(dto: CreateTaskDto): Promise<AiTask> {
      return api.post<AiTask>('/ai/tasks', dto);
    },

    /** 获取任务详情 */
    async getTask(taskId: string): Promise<AiTask | null> {
      try {
        return await api.get<AiTask>(`/ai/tasks/${taskId}`);
      } catch {
        return null;
      }
    },

    /** 获取任务列表 */
    async listTasks(cursor?: string): Promise<{ items: AiTask[]; nextCursor: string | null }> {
      const params = cursor ? `?cursor=${cursor}` : '';
      return api.get(`/ai/tasks${params}`);
    },

    /** 取消任务 */
    async cancelTask(taskId: string): Promise<{ ok: boolean }> {
      return api.post(`/ai/tasks/${taskId}/cancel`);
    }
  };
}

export type AiToolsApi = ReturnType<typeof createAiToolsApi>;
