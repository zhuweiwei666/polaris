import { Controller, Post, Param } from "@nestjs/common";

@Controller("artifacts")
export class ArtifactsController {
  /**
   * 产物下载：必须登录；不可分享
   * 推荐实现：
   * - 校验 artifact.owner_user_id === current user
   * - 返回 30~120 秒 signed URL（GCS）
   */
  @Post(":artifactId/download")
  download(@Param("artifactId") artifactId: string) {
    return {
      artifactId,
      todo: "auth + owner check + return short-lived signed url",
      signedUrl: "TODO"
    };
  }
}

