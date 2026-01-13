import { Body, Controller, Get, Post } from "@nestjs/common";

type VerifyAppStoreDto = {
  receiptData: string;
};

type VerifyGooglePlayDto = {
  packageName: string;
  productId: string;
  purchaseToken: string;
};

@Controller("billing")
export class BillingController {
  @Get("products")
  listProducts() {
    return [
      {
        planId: "free",
        title: "Free",
        entitlements: { removeAds: false, vipContent: false },
        quota: { dailyRequests: 5 }
      },
      {
        planId: "pro",
        title: "Pro",
        entitlements: { removeAds: true, vipContent: true, unlockVideo: true },
        quota: { dailyRequests: 50 }
      }
    ];
  }

  @Get("subscription")
  getSubscription() {
    return { todo: "return current subscription status by channel" };
  }

  @Get("orders")
  getOrders() {
    return { items: [], nextCursor: null };
  }

  @Post("appstore/verify")
  verifyAppStore(@Body() dto: VerifyAppStoreDto) {
    return { todo: "verify with App Store Server API", receiptLength: dto.receiptData.length };
  }

  @Post("googleplay/verify")
  verifyGooglePlay(@Body() dto: VerifyGooglePlayDto) {
    return { todo: "verify with Google Play Developer API", dto };
  }

  @Post("restore")
  restore() {
    return { todo: "restore purchase for iOS/Android" };
  }
}

