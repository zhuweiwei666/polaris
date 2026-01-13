export type Modality = "text" | "image" | "video";

export type ProviderId = string;

export type AiModelId = string;

export type AiGenerateRequest = {
  toolId: string;
  modality: Modality;
  /**
   * 统一 payload：
   * - 文本：{ prompt, ... }
   * - 图片：{ prompt, ... }
   * - 视频：{ prompt, seedImage?, ... }
   */
  payload: Record<string, unknown>;
  /**
   * 路由器可指定模型；或 provider 自己决定默认模型
   */
  model?: AiModelId;
};

export type AiArtifact = {
  type: "text" | "image" | "video";
  /**
   * 第一阶段：先放 raw 内容/临时 url（后续统一入 GCS，用 objectKey 存）
   */
  content?: string;
  tempUrl?: string;
  metadata?: Record<string, unknown>;
};

export type AiGenerateResult = {
  providerId: ProviderId;
  model?: AiModelId;
  artifacts: AiArtifact[];
  usage?: Record<string, unknown>;
};

export type AiProvider = {
  id: ProviderId;
  /**
   * 返回该 provider 是否“可用”（key 有无、开关等）
   */
  isEnabled(): boolean;
  generate(req: AiGenerateRequest): Promise<AiGenerateResult>;
};

