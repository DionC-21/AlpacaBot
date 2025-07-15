#!/bin/bash

# AlpacaBot Cloud Package Creator
# Creates a deployment-ready package for cloud servers

echo "📦 Creating AlpacaBot Cloud Deployment Package"
echo "=============================================="

PACKAGE_NAME="alpacabot-cloud-$(date +%Y%m%d-%H%M%S)"
PACKAGE_DIR="/tmp/$PACKAGE_NAME"

# Create package directory
mkdir -p "$PACKAGE_DIR"

echo "📁 Copying essential files..."

# Copy server files
cp -r server/ "$PACKAGE_DIR/"

# Copy Python scripts (exclude __pycache__)
cp *.py "$PACKAGE_DIR/"
cp requirements.txt "$PACKAGE_DIR/" 2>/dev/null || echo "⚠️  requirements.txt not found"

# Copy configuration files
cp config.py "$PACKAGE_DIR/" 2>/dev/null || echo "⚠️  config.py not found"
cp *.csv "$PACKAGE_DIR/" 2>/dev/null || echo "ℹ️  No CSV files found"

# Copy documentation
cp *.md "$PACKAGE_DIR/" 2>/dev/null || echo "ℹ️  No markdown files found"

# Create package.json for server
cat > "$PACKAGE_DIR/package.json" << 'EOF'
{
  "name": "alpacabot-server",
  "version": "1.0.0",
  "description": "AlpacaBot Trading Server",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "nodemailer": "^6.9.4",
    "twilio": "^4.14.0",
    "winston": "^3.10.0",
    "moment": "^2.29.4"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Create ecosystem.config.js for PM2
cat > "$PACKAGE_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'alpacabot-server',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/server-err.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true
    },
    {
      name: 'alpacabot-trading',
      script: 'python3',
      args: 'ross_cameron_pattern_trader.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      cwd: './',
      error_file: './logs/trading-err.log',
      out_file: './logs/trading-out.log',
      log_file: './logs/trading-combined.log',
      time: true
    }
  ]
};
EOF

# Create deployment instructions
cat > "$PACKAGE_DIR/DEPLOY.md" << 'EOF'
# AlpacaBot Cloud Deployment Instructions

## 1. Upload Files
Upload all files to your cloud server (e.g., using scp):
```bash
scp -r . username@your-server-ip:~/alpacabot/
```

## 2. Install Dependencies
```bash
cd ~/alpacabot
npm install
pip3 install -r requirements.txt
```

## 3. Configure Environment
Edit config.py with your API keys and settings.

## 4. Start Services
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Monitor
```bash
pm2 status
pm2 logs
pm2 monit
```

Your bot will be accessible at: http://YOUR_SERVER_IP:3001
EOF

# Create logs directory
mkdir -p "$PACKAGE_DIR/logs"

# Create archive
cd /tmp
tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"

echo ""
echo "✅ Package created successfully!"
echo "📦 Package location: /tmp/$PACKAGE_NAME.tar.gz"
echo "📁 Package size: $(du -h /tmp/$PACKAGE_NAME.tar.gz | cut -f1)"
echo ""
echo "🚀 Next steps:"
echo "1. Sign up for Oracle Cloud Always Free: https://cloud.oracle.com/free"
echo "2. Create an Ubuntu VM instance"
echo "3. Upload the package: scp /tmp/$PACKAGE_NAME.tar.gz user@server:~/"
echo "4. Extract and deploy: tar -xzf $PACKAGE_NAME.tar.gz && cd $PACKAGE_NAME"
echo "5. Run: bash ../deploy-to-cloud.sh"
echo ""
echo "🌟 Your bot will run 24/7 on the cloud!"
