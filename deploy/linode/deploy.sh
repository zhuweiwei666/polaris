#!/bin/bash
set -e

# ===============================================
# Polaris Platform - Linode Deployment Script
# ===============================================

SERVER_IP="${LINODE_IP:-170.187.234.128}"
SERVER_USER="${LINODE_USER:-root}"
DEPLOY_DIR="/opt/polaris"

echo "🚀 Deploying to Linode server: $SERVER_IP"

# 1. Sync code to server
echo "📦 Syncing code..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env*' \
  -e "ssh -o StrictHostKeyChecking=no" \
  ../../ "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/"

# 2. SSH to server and build/deploy
echo "🔨 Building and deploying on server..."
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'REMOTE_SCRIPT'
set -e
cd /opt/polaris/deploy/linode

# Ensure Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Ensure Docker Compose plugin is available
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    apt-get update
    apt-get install -y docker-compose-plugin
fi

# Create TLS directory if not exists
mkdir -p ./tls

# Check if TLS certs exist
if [ ! -f "./tls/cert.pem" ] || [ ! -f "./tls/key.pem" ]; then
    echo "⚠️  TLS certificates not found in ./tls/"
    echo "Please place cert.pem and key.pem in /opt/polaris/deploy/linode/tls/"
fi

# Build and deploy
echo "🐳 Building Docker images..."
docker compose build --no-cache

echo "🚀 Starting services..."
docker compose down || true
docker compose up -d

# Wait for services to start
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker compose exec -T api npx prisma migrate deploy || echo "Migration skipped (no pending migrations or DB not ready)"

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
docker compose ps
echo ""
echo "🌐 Access your app at: https://clingai.live"
REMOTE_SCRIPT

echo ""
echo "🎉 Deployment finished!"
