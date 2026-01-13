'use client';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizes = {
  sm: '24px',
  md: '40px',
  lg: '64px'
};

export function Loading({ size = 'md', text }: LoadingProps) {
  return (
    <div className="polaris-loading">
      <div
        className="polaris-loading__spinner"
        style={{ width: sizes[size], height: sizes[size] }}
      />
      {text && <div className="polaris-loading__text">{text}</div>}

      <style>{`
        .polaris-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .polaris-loading__spinner {
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: polaris-spin 0.8s linear infinite;
        }
        .polaris-loading__text {
          margin-top: 12px;
          color: var(--color-text-muted);
          font-size: 14px;
        }
        @keyframes polaris-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export function FullPageLoading({ text }: { text?: string }) {
  return (
    <div className="polaris-loading-full">
      <Loading size="lg" text={text} />

      <style>{`
        .polaris-loading-full {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-background);
        }
      `}</style>
    </div>
  );
}
