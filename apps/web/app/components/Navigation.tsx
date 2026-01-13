'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import appConfig from "../../app.config";

export function Navigation() {
  const pathname = usePathname();

  // 从 app.config 读取 tabs
  const navItems = appConfig.tabs;

  // 管理入口（可选）
  const adminItems = [
    { id: 'providers', href: '/admin/providers', label: '⚙️ Providers' }
  ];

  return (
    <nav className="polaris-nav">
      <div className="polaris-nav__logo">{appConfig.appName}</div>
      <div className="polaris-nav__items">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.route}
            className={`polaris-nav__item ${pathname === item.route ? 'polaris-nav__item--active' : ''}`}
          >
            {item.icon && <span className="polaris-nav__icon">{item.icon}</span>}
            {item.label}
          </Link>
        ))}
      </div>

      <div className="polaris-nav__divider" />

      <div className="polaris-nav__section-title">运营后台</div>
      <div className="polaris-nav__items">
        {adminItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`polaris-nav__item ${pathname === item.href ? 'polaris-nav__item--active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="polaris-nav__footer">
        <div className="polaris-nav__api-badge">
          API: <span className="polaris-nav__api-url">{appConfig.api.baseUrl}</span>
        </div>
      </div>
    </nav>
  );
}
