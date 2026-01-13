'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.reset });
      }

      return (
        <div className="polaris-error">
          <div className="polaris-error__icon">⚠️</div>
          <div className="polaris-error__title">Something went wrong</div>
          <div className="polaris-error__message">{this.state.error.message}</div>
          <button className="polaris-error__btn" onClick={this.reset}>
            Try again
          </button>

          <style>{`
            .polaris-error {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 48px 24px;
              text-align: center;
            }
            .polaris-error__icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            .polaris-error__title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .polaris-error__message {
              color: var(--color-text-muted);
              margin-bottom: 16px;
              max-width: 400px;
            }
            .polaris-error__btn {
              padding: 10px 20px;
              background: var(--color-primary);
              color: white;
              border: none;
              border-radius: var(--radius-md);
              cursor: pointer;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
