import { Controller, Get } from "@nestjs/common";

@Controller("quota")
export class QuotaController {
  @Get("me/usage")
  getMyUsage() {
    return {
      today: { used: 0, remaining: 5 },
      month: { used: 0, remaining: 50 },
      todo: "Implement ledger-based reserve/commit/release and real policy"
    };
  }
}

