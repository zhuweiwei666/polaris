'use client';

import { useState } from 'react';
import { useAuth } from '@polaris/core';
import type { User } from '@polaris/core';

interface LoginModalProps {
  onSuccess: (user: User) => void;
  onClose?: () => void;
}

export function LoginModal({ onSuccess, onClose }: LoginModalProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading('google');
    setError(null);
    
    try {
      // TODO: 集成真正的 Google Sign-In SDK
      // 目前使用 mock token 进行测试
      const mockIdToken = 'mock_google_id_token_' + Date.now();
      const user = await auth.loginWithProvider('google', mockIdToken);
      onSuccess(user);
    } catch (err) {
      setError('Google 登录失败，请重试');
    } finally {
      setLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setLoading('apple');
    setError(null);
    
    try {
      // TODO: 集成真正的 Apple Sign-In SDK
      const mockIdToken = 'mock_apple_id_token_' + Date.now();
      const user = await auth.loginWithProvider('apple', mockIdToken);
      onSuccess(user);
    } catch (err) {
      setError('Apple 登录失败，请重试');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal__header">
          <h2>登录</h2>
          <p>登录后可同步数据、解锁更多功能</p>
        </div>

        <div className="login-modal__buttons">
          <button
            className="login-btn login-btn--google"
            onClick={handleGoogleLogin}
            disabled={loading !== null}
          >
            {loading === 'google' ? (
              <span className="login-btn__spinner" />
            ) : (
              <svg className="login-btn__icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>使用 Google 登录</span>
          </button>

          <button
            className="login-btn login-btn--apple"
            onClick={handleAppleLogin}
            disabled={loading !== null}
          >
            {loading === 'apple' ? (
              <span className="login-btn__spinner" />
            ) : (
              <svg className="login-btn__icon" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )}
            <span>使用 Apple 登录</span>
          </button>
        </div>

        {error && <div className="login-modal__error">{error}</div>}

        <div className="login-modal__footer">
          <p>登录即表示同意<a href="/terms">服务条款</a>和<a href="/privacy">隐私政策</a></p>
        </div>

        {onClose && (
          <button className="login-modal__close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <style>{`
        .login-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .login-modal {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 16px;
          padding: 32px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }
        .login-modal__header {
          text-align: center;
          margin-bottom: 24px;
        }
        .login-modal__header h2 {
          margin: 0 0 8px;
          font-size: 24px;
        }
        .login-modal__header p {
          margin: 0;
          color: var(--color-text-muted);
        }
        .login-modal__buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-btn__icon {
          width: 20px;
          height: 20px;
        }
        .login-btn--google {
          background: white;
          color: #333;
        }
        .login-btn--google:hover:not(:disabled) {
          background: #f5f5f5;
        }
        .login-btn--apple {
          background: #000;
          color: white;
        }
        .login-btn--apple:hover:not(:disabled) {
          background: #222;
        }
        .login-btn__spinner {
          width: 20px;
          height: 20px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .login-modal__error {
          margin-top: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-sm);
          color: #ef4444;
          text-align: center;
        }
        .login-modal__footer {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: var(--color-text-muted);
        }
        .login-modal__footer a {
          color: var(--color-primary);
        }
        .login-modal__close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: 50%;
        }
        .login-modal__close:hover {
          background: var(--color-border);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
