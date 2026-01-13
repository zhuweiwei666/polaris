import { createModule } from '../registry';
import { ProfilePage } from './ui/ProfilePage';
import { SettingsPage } from './ui/SettingsPage';

export const userCenterModule = createModule({
  moduleId: 'user-center',
  displayName: '个人中心',
  version: '1.0.0',

  routes: [
    {
      path: '/me',
      component: ProfilePage as any,
      guard: 'public',
      title: '我的'
    },
    {
      path: '/settings',
      component: SettingsPage as any,
      guard: 'public',
      title: '设置'
    }
  ],

  tabItem: {
    label: '我的',
    icon: '👤',
    order: 99
  },

  configSchema: {
    showOrders: {
      type: 'boolean',
      default: true,
      description: '是否显示订单历史'
    },
    showWallet: {
      type: 'boolean',
      default: true,
      description: '是否显示钱包'
    }
  }
});

export { ProfilePage } from './ui/ProfilePage';
export { SettingsPage } from './ui/SettingsPage';
export type { UserCenterConfig, SettingsItem } from './types';
