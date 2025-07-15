#!/bin/bash

# AlpacaBot Railway.app Deployment Package Creator - MINIMAL VERSION
# Creates a clean deployment without conflicting build configurations

echo "🚂 Creating AlpacaBot Railway Deployment Package (Minimal/Clean)"
echo "=============================================================="

PACKAGE_NAME="alpacabot-railway-clean-$(date +%Y%m%d-%H%M%S)"
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

# Create clean package.json (Railway auto-detects Node.js)
cat > "$PACKAGE_DIR/package.json" << 'EOF'
{
  "name": "alpacabot-railway",
  "version": "1.0.0",
  "description": "AlpacaBot Trading System - Railway Deployment",
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
    "moment": "^2.29.4",
    "moment-timezone": "^0.5.43",
    "node-cron": "^3.0.2",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["trading", "bot", "alpaca", "railway"],
  "license": "MIT"
}
EOF

# Create clean requirements.txt for Python dependencies
cat > "$PACKAGE_DIR/requirements.txt" << 'EOF'
alpaca-trade-api==3.0.2
pandas==2.0.3
numpy==1.24.3
requests==2.31.0
python-dotenv==1.0.0
schedule==1.2.0
psutil==5.9.5
yfinance==0.2.18
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
venv/
.venv/
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

# Create Railway deployment instructions
cat > "$PACKAGE_DIR/README.md" << 'EOF'
# 🚂 AlpacaBot Railway Deployment

## Quick Deployment (2 minutes)

### 1. Create GitHub Repository
```bash
git init
git add .
git commit -m "AlpacaBot Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alpacabot-railway.git
git push -u origin main
```

### 2. Deploy on Railway
1. Go to https://railway.app
2. Login with GitHub
3. "New Project" → "Deploy from GitHub" 
4. Select your repository
5. Click "Deploy"

### 3. Add Environment Variables
In Railway dashboard → Variables tab:
```
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key  
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

### 4. Verify Deployment
- Check deployment logs for errors
- Visit your Railway URL
- Test `/health` endpoint

## 🎯 Important Notes
- This package uses Railway's auto-detection (no custom build configs)
- Railway automatically detects Node.js and installs Python dependencies
- No Procfile, nixpacks.toml, or railway.json needed
- Simpler = more reliable deployments

## 🔧 If Build Fails
Railway should auto-detect and build successfully. If not:
1. Check that `package.json` and `requirements.txt` are valid
2. Review Railway build logs for specific errors
3. Ensure all file paths are correct in your code

## 💰 Cost
- FREE tier: $5/month credits (more than enough for trading bots)
- No credit card required
- 24/7 uptime (no sleeping)

Your bot will be running at: `https://yourapp.railway.app`
EOF

# Create logs directory
mkdir -p "$PACKAGE_DIR/logs"

echo ""
echo "✅ CLEAN Railway deployment package created!"
echo "📦 Location: $PACKAGE_DIR"
echo "📁 Size: $(du -sh $PACKAGE_DIR | cut -f1)"
echo ""
echo "🔧 Key Features of This Package:"
echo "   • No conflicting build configurations"
echo "   • Railway auto-detection friendly"
echo "   • Minimal and clean setup"
echo "   • No Procfile/nixpacks.toml conflicts"
echo ""
echo "🚂 Deployment Steps:"
echo "1. cd $PACKAGE_DIR"
echo "2. Create GitHub repo and push this folder"
echo "3. Deploy from GitHub in Railway dashboard"
echo "4. Add environment variables (API keys)"
echo ""
echo "💡 This should resolve the 'build plan with Railpack' errors!"
