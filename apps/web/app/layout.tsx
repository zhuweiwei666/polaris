import "./globals.css";
import type { ReactNode } from "react";
import { CoreProviders } from "../providers/CoreProviders";
import { Navigation } from "./components/Navigation";
import appConfig from "../app.config";

export const metadata = {
  title: appConfig.appName,
  description: `${appConfig.appName} - AI 创作平台`
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <CoreProviders>
          <div className="polaris-shell" data-app-id={appConfig.appId}>
            <div className="polaris-shell__container">
              <Navigation />
              <main className="polaris-shell__main">{children}</main>
            </div>
          </div>
        </CoreProviders>
      </body>
    </html>
  );
}
