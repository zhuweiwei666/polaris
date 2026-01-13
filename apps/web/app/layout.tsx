import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Zhongtai Web",
  description: "北极星中台 - Web 壳"
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/status", label: "Status" },
  { href: "/create", label: "Create" },
  { href: "/library", label: "Library" },
  { href: "/inbox", label: "Inbox" },
  { href: "/me", label: "Me" },
  { href: "/settings", label: "Settings" },
  { href: "/paywall", label: "Paywall" }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  return (
    <html lang="zh-CN">
      <body>
        <div className="container">
          <div className="shell">
            <nav className="nav">
              <h1>北极星产品壳</h1>
              {navItems.map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                </Link>
              ))}
              <div style={{ marginTop: 12 }} className="pill">
                API：<span className="muted">{base}</span>
              </div>
            </nav>
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

