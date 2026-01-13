'use client';

import type { EmptyStateProps } from './types';

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="polaris-empty">
      {icon && <div className="polaris-empty__icon">{icon}</div>}
      <div className="polaris-empty__title">{title}</div>
      {description && <div className="polaris-empty__desc">{description}</div>}
      {action && <div className="polaris-empty__action">{action}</div>}

      <style>{`
        .polaris-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }
        .polaris-empty__icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .polaris-empty__title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .polaris-empty__desc {
          color: var(--color-text-muted);
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
