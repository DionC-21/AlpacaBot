#!/bin/bash

# AlpacaBot Railway.app Deployment Package Creator
# Creates a deployment-ready package for Railway (no credit card required)

echo "🚂 Creating AlpacaBot Railway Deployment Package"
echo "==============================================="

PACKAGE_NAME="alpacabot-railway-$(date +%Y%m%d-%H%M%S)"
PACKAGE_DIR="/tmp/$PACKAGE_NAME"

# Create package directory
mkdir -p "$PACKAGE_DIR"

echo "📁 Copying files for Railway deployment..."

# Copy server files
if [ -d "server/" ]; then
    cp -r server/ "$PACKAGE_DIR/"
    echo "✅ Server files copied"
else
    echo "⚠️  Server directory not found"
fi

# Copy Python scripts (exclude __pycache__)
find . -name "*.py" -not -path "./__pycache__/*" -not -path "./venv*/*" -exec cp {} "$PACKAGE_DIR/" \;
echo "✅ Python scripts copied"

# Copy configuration files
cp config.py "$PACKAGE_DIR/" 2>/dev/null && echo "✅ config.py copied" || echo "⚠️  config.py not found"
cp requirements.txt "$PACKAGE_DIR/" 2>/dev/null && echo "✅ requirements.txt copied" || echo "⚠️  requirements.txt not found"

# Copy Railway-specific package.json
cp railway-package.json "$PACKAGE_DIR/package.json" 2>/dev/null && echo "✅ Railway package.json copied"

# Update the repository URL in package.json (if needed)
# Note: Users should update this with their actual GitHub username
sed -i '' 's/YOUR_USERNAME/REPLACE_WITH_YOUR_GITHUB_USERNAME/g' "$PACKAGE_DIR/package.json"

# If the railway-package.json doesn't exist, create a basic one
if [ ! -f "$PACKAGE_DIR/package.json" ]; then
cat > "$PACKAGE_DIR/package.json" << 'EOF'
{
  "name": "alpacabot-railway",
  "version": "1.0.0",
  "description": "AlpacaBot Trading System - Railway Deployment",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "build": "echo 'No build step required'",
    "railway-start": "node server/index.js"
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
  },
  "keywords": ["trading", "bot", "alpaca", "railway", "fintech"],
  "license": "MIT"
}
EOF
fi

# Create Procfile for Railway
cat > "$PACKAGE_DIR/Procfile" << 'EOF'
web: node server/index.js
worker: python3 ross_cameron_pattern_trader.py
EOF

# Create railway.json configuration
cat > "$PACKAGE_DIR/railway.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "node server/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "always"
  }
}
EOF

# Create nixpacks.toml for custom build
cat > "$PACKAGE_DIR/nixpacks.toml" << 'EOF'
[phases.setup]
nixPkgs = ["nodejs", "python3", "pip"]

[phases.install]
cmds = ["npm install", "pip install -r requirements.txt"]

[phases.build]
cmds = ["echo 'Build complete'"]

[start]
cmd = "node server/index.js"
EOF

# Create .gitignore
cat > "$PACKAGE_DIR/.gitignore" << 'EOF'
node_modules/
.env
.env.local
__pycache__/
*.pyc
logs/
.DS_Store
*.log
EOF

# Create environment template
cat > "$PACKAGE_DIR/.env.example" << 'EOF'
# AlpacaBot Environment Variables for Railway
PORT=3001
NODE_ENV=production

# Alpaca API Configuration
ALPACA_API_KEY=your_api_key_here
ALPACA_SECRET_KEY=your_secret_key_here
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Email/SMS Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio SMS (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
EOF

# Create health check endpoint in server
cat > "$PACKAGE_DIR/health.js" << 'EOF'
// Simple health check for Railway
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'alpacabot',
    uptime: process.uptime()
  });
});

module.exports = router;
EOF

# Create Railway deployment instructions
cat > "$PACKAGE_DIR/RAILWAY_DEPLOY.md" << 'EOF'
# 🚂 AlpacaBot Railway Deployment Guide

Railway.app is perfect for your trading bot - **no credit card required** for the free tier!

## 🚀 Quick Deployment Steps

### 1. Prepare Your Code
```bash
# Your package is ready! Just follow these steps:
```

### 2. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (no credit card required)
3. Connect your GitHub account

### 3. Deploy Methods

#### Method A: GitHub Integration (Recommended)
1. Create new GitHub repository
2. Upload this folder to your repo
3. In Railway: "New Project" → "Deploy from GitHub"
4. Select your repository
5. Railway auto-detects Node.js and deploys!

#### Method B: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway deploy
```

### 4. Configure Environment Variables
In Railway dashboard, add these variables:
- `ALPACA_API_KEY`: Your Alpaca API key
- `ALPACA_SECRET_KEY`: Your Alpaca secret
- `ALPACA_BASE_URL`: https://paper-api.alpaca.markets
- `PORT`: 3001

### 5. Access Your Bot
- Railway provides a URL: `https://yourapp.railway.app`
- Your trading interface will be available there

## 💰 Free Tier Limits
- **Usage**: $5/month credit (plenty for trading bots)
- **Memory**: 512MB RAM
- **CPU**: Shared
- **Bandwidth**: 100GB/month
- **Always On**: ✅ No sleeping!

## 📊 Monitoring
- View logs in Railway dashboard
- Built-in metrics and monitoring
- Real-time deployment status

## 🔧 Custom Domain (Optional)
- Add custom domain in Railway settings
- Automatic SSL certificates
- Professional appearance

## 🚨 Important Notes
- Railway doesn't sleep your app (unlike Heroku free tier)
- Perfect for trading bots that need 24/7 uptime
- No credit card needed for basic usage
- Upgrade only when you exceed $5/month

## 🎯 Post-Deployment
1. Test your bot: Visit your Railway URL
2. Check logs for any errors
3. Verify trading functionality
4. Set up monitoring/alerts

Your AlpacaBot will run 24/7 on Railway for FREE! 🎉
EOF

# Create requirements.txt if it doesn't exist
if [ ! -f "$PACKAGE_DIR/requirements.txt" ]; then
    cat > "$PACKAGE_DIR/requirements.txt" << 'EOF'
alpaca-trade-api==3.0.2
pandas==2.0.3
numpy==1.24.3
requests==2.31.0
python-dotenv==1.0.0
schedule==1.2.0
psutil==5.9.5
EOF
    echo "✅ Created requirements.txt"
fi

# Create logs directory
mkdir -p "$PACKAGE_DIR/logs"

# Create archive
cd /tmp
tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"

echo ""
echo "✅ Railway deployment package created!"
echo "📦 Package: /tmp/$PACKAGE_NAME.tar.gz"
echo "📁 Size: $(du -h /tmp/$PACKAGE_NAME.tar.gz | cut -f1)"
echo ""
echo "🚂 Next Steps:"
echo "1. Sign up at https://railway.app (no credit card required)"
echo "2. Create GitHub repo and upload this package"
echo "3. Deploy from GitHub in Railway dashboard"
echo "4. Add environment variables (API keys)"
echo ""
echo "💡 Cost: FREE ($5/month credits included)"
echo "🎯 Your bot will run 24/7 for free!"
