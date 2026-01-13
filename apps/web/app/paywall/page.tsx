'use client';

import { useBilling, useSubscription, useAuth } from '@polaris/core';
import { useEffect, useState } from 'react';
import type { Product } from '@polaris/core';

export default function PaywallPage() {
  const auth = useAuth();
  const billing = useBilling();
  const subscription = useSubscription();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    billing.getProducts().then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, [billing]);

  const handlePurchase = async (product: Product) => {
    if (!auth.isAuthenticated()) {
      try {
        await auth.requireLogin();
      } catch {
        return;
      }
    }

    setPurchasing(product.productId);
    try {
      if (product.type === 'subscription') {
        await billing.purchaseSubscription(product.productId);
      } else if (product.type === 'coins') {
        await billing.purchaseCoins(product.productId);
      }
      // 刷新页面显示新状态
      window.location.reload();
    } catch (err) {
      alert('购买失败: ' + String(err));
    } finally {
      setPurchasing(null);
    }
  };

  const subscriptionProducts = products.filter((p) => p.type === 'subscription' && p.productId !== 'free');
  const coinsProducts = products.filter((p) => p.type === 'coins');
  const isPro = subscription?.status === 'active';

  if (loading) {
    return (
      <div className="paywall">
        <div className="paywall__loading">加载中...</div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="paywall">
      {/* Header */}
      <div className="paywall__header">
        <h1>解锁无限创作</h1>
        <p>升级 Pro，享受更多权益</p>
      </div>

      {/* Current status */}
      {isPro && (
        <div className="paywall__status paywall__status--active">
          <div className="paywall__status-icon">✓</div>
          <div className="paywall__status-info">
            <span className="paywall__status-title">Pro 会员生效中</span>
            <span className="paywall__status-expires">
              到期时间: {new Date(subscription!.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="paywall__benefits">
        <h3>Pro 会员权益</h3>
        <div className="paywall__benefit-list">
          <div className="paywall__benefit">
            <span className="paywall__benefit-icon">⚡</span>
            <div>
              <span className="paywall__benefit-title">更多次数</span>
              <span className="paywall__benefit-desc">每日 100 次，免费版仅 5 次</span>
            </div>
          </div>
          <div className="paywall__benefit">
            <span className="paywall__benefit-icon">🎬</span>
            <div>
              <span className="paywall__benefit-title">解锁视频</span>
              <span className="paywall__benefit-desc">生成高清视频内容</span>
            </div>
          </div>
          <div className="paywall__benefit">
            <span className="paywall__benefit-icon">🎨</span>
            <div>
              <span className="paywall__benefit-title">高清图片</span>
              <span className="paywall__benefit-desc">4K 分辨率导出</span>
            </div>
          </div>
          <div className="paywall__benefit">
            <span className="paywall__benefit-icon">🚀</span>
            <div>
              <span className="paywall__benefit-title">优先队列</span>
              <span className="paywall__benefit-desc">任务优先处理，减少等待</span>
            </div>
          </div>
          <div className="paywall__benefit">
            <span className="paywall__benefit-icon">🚫</span>
            <div>
              <span className="paywall__benefit-title">无广告</span>
              <span className="paywall__benefit-desc">纯净创作体验</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription plans */}
      <div className="paywall__section">
        <h3>订阅套餐</h3>
        <div className="paywall__plans">
          {subscriptionProducts.map((product) => {
            const isYearly = product.productId.includes('yearly');
            const monthlyPrice = isYearly 
              ? Math.round(product.price.amount / 12) 
              : product.price.amount;

            return (
              <div 
                key={product.productId} 
                className={`paywall__plan ${isYearly ? 'paywall__plan--featured' : ''}`}
              >
                {isYearly && <div className="paywall__plan-badge">省 33%</div>}
                <div className="paywall__plan-name">{product.title}</div>
                <div className="paywall__plan-price">
                  <span className="paywall__plan-amount">${(monthlyPrice / 100).toFixed(2)}</span>
                  <span className="paywall__plan-period">/月</span>
                </div>
                {isYearly && (
                  <div className="paywall__plan-total">
                    年付 ${(product.price.amount / 100).toFixed(2)}
                  </div>
                )}
                <button
                  className="paywall__plan-btn"
                  onClick={() => handlePurchase(product)}
                  disabled={isPro || purchasing !== null}
                >
                  {purchasing === product.productId ? (
                    '处理中...'
                  ) : isPro ? (
                    '已订阅'
                  ) : (
                    '立即订阅'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coins packages */}
      <div className="paywall__section">
        <h3>金币充值</h3>
        <p className="paywall__section-desc">金币可用于额外次数或特殊功能</p>
        <div className="paywall__coins">
          {coinsProducts.map((product) => (
            <div key={product.productId} className="paywall__coin">
              <div className="paywall__coin-icon">💎</div>
              <div className="paywall__coin-info">
                <span className="paywall__coin-amount">{product.coins}</span>
                {product.description && (
                  <span className="paywall__coin-bonus">{product.description}</span>
                )}
              </div>
              <button
                className="paywall__coin-btn"
                onClick={() => handlePurchase(product)}
                disabled={purchasing !== null}
              >
                {purchasing === product.productId 
                  ? '...' 
                  : `$${(product.price.amount / 100).toFixed(2)}`
                }
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="paywall__footer">
        <p>· 支付即表示同意<a href="/terms">服务条款</a></p>
        <p>· 订阅可随时取消，到期后自动停止</p>
        <p>· 如有问题请联系客服</p>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .paywall {
    padding: 24px;
    max-width: 600px;
  }
  .paywall__loading {
    padding: 48px;
    text-align: center;
    color: var(--color-text-muted);
  }

  /* Header */
  .paywall__header {
    text-align: center;
    margin-bottom: 24px;
  }
  .paywall__header h1 {
    margin: 0 0 8px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .paywall__header p {
    margin: 0;
    color: var(--color-text-muted);
  }

  /* Status */
  .paywall__status {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
  }
  .paywall__status--active {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  .paywall__status-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #22c55e;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  .paywall__status-info {
    display: flex;
    flex-direction: column;
  }
  .paywall__status-title {
    font-weight: 600;
    color: #22c55e;
  }
  .paywall__status-expires {
    font-size: 14px;
    color: var(--color-text-muted);
  }

  /* Benefits */
  .paywall__benefits {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 20px;
    margin-bottom: 24px;
  }
  .paywall__benefits h3 {
    margin: 0 0 16px;
    font-size: 16px;
  }
  .paywall__benefit-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .paywall__benefit {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .paywall__benefit-icon {
    font-size: 24px;
    flex-shrink: 0;
  }
  .paywall__benefit-title {
    display: block;
    font-weight: 500;
  }
  .paywall__benefit-desc {
    display: block;
    font-size: 14px;
    color: var(--color-text-muted);
  }

  /* Section */
  .paywall__section {
    margin-bottom: 24px;
  }
  .paywall__section h3 {
    margin: 0 0 8px;
  }
  .paywall__section-desc {
    margin: 0 0 16px;
    font-size: 14px;
    color: var(--color-text-muted);
  }

  /* Plans */
  .paywall__plans {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .paywall__plan {
    position: relative;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 20px;
    text-align: center;
  }
  .paywall__plan--featured {
    border-color: var(--color-primary);
    background: linear-gradient(180deg, rgba(99, 102, 241, 0.05), transparent);
  }
  .paywall__plan-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 12px;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: white;
    font-size: 12px;
    font-weight: 600;
    border-radius: 999px;
  }
  .paywall__plan-name {
    font-weight: 600;
    margin-bottom: 12px;
  }
  .paywall__plan-price {
    margin-bottom: 4px;
  }
  .paywall__plan-amount {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-primary);
  }
  .paywall__plan-period {
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .paywall__plan-total {
    font-size: 14px;
    color: var(--color-text-muted);
    margin-bottom: 16px;
  }
  .paywall__plan-btn {
    width: 100%;
    padding: 12px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
  }
  .paywall__plan-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Coins */
  .paywall__coins {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .paywall__coin {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }
  .paywall__coin-icon {
    font-size: 32px;
  }
  .paywall__coin-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .paywall__coin-amount {
    font-size: 20px;
    font-weight: 700;
  }
  .paywall__coin-bonus {
    font-size: 14px;
    color: #22c55e;
  }
  .paywall__coin-btn {
    padding: 10px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
  }
  .paywall__coin-btn:disabled {
    opacity: 0.6;
  }

  /* Footer */
  .paywall__footer {
    text-align: center;
    font-size: 12px;
    color: var(--color-text-muted);
  }
  .paywall__footer p {
    margin: 4px 0;
  }
  .paywall__footer a {
    color: var(--color-primary);
  }
`;
