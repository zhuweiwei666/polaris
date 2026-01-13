export interface UserCenterConfig {
  /** 是否显示订单历史 */
  showOrders?: boolean;
  /** 是否显示钱包 */
  showWallet?: boolean;
  /** 设置项 */
  settingsItems?: SettingsItem[];
}

export interface SettingsItem {
  id: string;
  label: string;
  type: 'link' | 'toggle' | 'action';
  href?: string;
  value?: boolean;
  onAction?: () => void;
}

export interface UserCenterEvents {
  'user_center.profile_viewed': {
    description: '用户查看个人中心';
    properties: {};
  };
  'user_center.settings_changed': {
    description: '用户修改设置';
    properties: {
      settingId: 'string';
      value: 'string';
    };
  };
  'user_center.logout_clicked': {
    description: '用户点击登出';
    properties: {};
  };
}
