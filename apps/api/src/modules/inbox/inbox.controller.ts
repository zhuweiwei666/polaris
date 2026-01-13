import { Controller, Get, Param, Post, Query } from "@nestjs/common";

type InboxMessage = {
  id: string;
  type: "system" | "billing" | "task";
  title: string;
  body: string;
  deepLink?: string;
  createdAt: string;
  readAt?: string;
};

const messages: InboxMessage[] = [];

@Controller("inbox")
export class InboxController {
  @Get()
  list(@Query("cursor") _cursor?: string) {
    return { items: messages.slice(0, 50), nextCursor: null };
  }

  @Get("unread-count")
  unreadCount() {
    return { count: messages.filter((m) => !m.readAt).length };
  }

  @Post(":id/read")
  read(@Param("id") id: string) {
    const msg = messages.find((m) => m.id === id);
    if (msg && !msg.readAt) msg.readAt = new Date().toISOString();
    return { ok: true };
  }

  @Post("read-all")
  readAll() {
    const now = new Date().toISOString();
    for (const m of messages) {
      if (!m.readAt) m.readAt = now;
    }
    return { ok: true };
  }
}

