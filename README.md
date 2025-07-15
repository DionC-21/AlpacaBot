# 🤖 AlpacaBot - Automated Trading System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://python.org/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-purple.svg)](https://railway.app)

A sophisticated automated trading bot built with React, Electron, Node.js, and Python. Features pattern recognition, pre-market scanning, real-time monitoring, and 24/7 cloud deployment capabilities.

![AlpacaBot Dashboard](https://via.placeholder.com/800x400/1a1a1a/00ff00?text=AlpacaBot+Dashboard)

## ✨ Features

### 🎯 Core Trading Features
- **Ross Cameron Pattern Recognition** - Implements proven trading patterns
- **Pre-market Scanning** - Identifies opportunities before market open
- **Real-time Monitoring** - Live position tracking and P&L updates
- **Risk Management** - Automated stop-losses and position sizing
- **Pattern Analysis** - ABCD, Bull Flags, and momentum patterns

### 🖥️ Desktop Application
- **Electron-based GUI** - Modern React interface
- **System Tray Integration** - Run in background on macOS/Windows
- **Auto-start on Login** - Seamless integration with your system
- **Real-time Dashboard** - Live charts, positions, and account info

### ☁️ Cloud Deployment
- **Railway.app Integration** - Deploy for FREE (no credit card required)
- **24/7 Operation** - Never sleeps, always monitoring markets
- **AWS/Oracle Cloud Support** - Enterprise deployment options
- **Docker Ready** - Containerized for easy deployment

### 📊 Monitoring & Alerts
- **Email Notifications** - Trade alerts and daily reports
- **SMS Integration** - Twilio-powered instant alerts
- **Comprehensive Logging** - Detailed trade history and performance
- **Health Monitoring** - Built-in status endpoints

## 🚀 Quick Start

### Option 1: Desktop Application (Local)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/AlpacaBot.git
cd AlpacaBot

# Install dependencies
npm install
cd client && npm install && cd ..
pip install -r requirements.txt

# Configure your API keys
cp .env.example .env
# Edit .env with your Alpaca API keys

# Start the desktop app
npm run electron
```

### Option 2: Cloud Deployment (Railway.app - FREE)

```bash
# Test deployment readiness
./test-railway-deployment.sh

# Create deployment package
./package-for-railway.sh

# Follow the Railway deployment guide
# See RAILWAY_QUICK_START.md for 5-minute setup
```

## 📋 Prerequisites

### Required:
- **Node.js 16+** - For the server and Electron app
- **Python 3.8+** - For trading algorithms and data analysis
- **Alpaca API Account** - [Get free paper trading account](https://alpaca.markets/)

### Optional:
- **Gmail Account** - For email notifications
- **Twilio Account** - For SMS alerts
- **GitHub Account** - For cloud deployment

## 🔧 Configuration

### 1. Alpaca API Setup
```bash
# Get your API keys from Alpaca
# Paper trading: https://app.alpaca.markets/paper/dashboard/overview
# Live trading: https://app.alpaca.markets/brokerage/dashboard/overview

# Add to .env file:
ALPACA_API_KEY=your_api_key_here
ALPACA_SECRET_KEY=your_secret_key_here
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

### 2. Email Notifications (Optional)
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Use App Password, not regular password
```

### 3. SMS Alerts (Optional)
```bash
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## 🏗️ Architecture

```
AlpacaBot/
├── 🖥️  client/                 # React + Electron Desktop App
│   ├── src/components/         # Trading dashboard components
│   ├── public/electron.js      # Main Electron process
│   └── scripts/               # System integration scripts
├── 🌐 server/                  # Node.js API Server
│   ├── index.js               # Main server with WebSocket
│   ├── tradingBot.js          # Core trading logic
│   └── emailSMSService.js     # Notification services
├── 🐍 python_scripts/         # Python Trading Algorithms
│   ├── ross_cameron_pattern_trader.py
│   ├── pattern_analyzer.py
│   └── market scanners/
└── ☁️  deployment/            # Cloud deployment configs
    ├── Railway.app
    ├── AWS EC2
    └── Oracle Cloud
```

## 📊 Trading Strategies

### Ross Cameron Patterns
- **ABCD Pattern** - Classic momentum reversal
- **Bull Flag** - Continuation pattern after breakout
- **Pre-market Gappers** - High-volume morning opportunities
- **Momentum Trading** - Trend-following with tight stops

### Risk Management
- **Position Sizing** - Based on account balance and volatility
- **Stop Losses** - Automatic protective stops
- **Daily Loss Limits** - Prevents overtrading
- **Pattern Confirmation** - Multiple indicators required

## 🚂 Cloud Deployment Options

### Railway.app (Recommended - FREE)
- ✅ $5/month free credits (no card required)
- ✅ 24/7 uptime (no sleeping)
- ✅ Auto-deployment from GitHub
- ✅ Built-in monitoring and logs

**Quick Deploy:** See [`RAILWAY_QUICK_START.md`](RAILWAY_QUICK_START.md)

### AWS EC2
- Enterprise-grade infrastructure
- Full control over environment
- Scalable and reliable

**Deploy Guide:** See [`AWS_DEPLOYMENT_GUIDE.md`](AWS_DEPLOYMENT_GUIDE.md)

### Oracle Cloud (Always Free)
- Permanent free tier
- ARM-based instances
- Generous resource limits

## 📱 Desktop Features

### System Integration
- **macOS LaunchAgent** - Auto-start on login
- **Windows Service** - Background operation
- **System Tray** - Minimize to tray, quick controls
- **Sleep Prevention** - Keeps system awake during trading

### Installation Scripts
```bash
# macOS service installation
./client/scripts/install-service-macos.sh

# Prevent macOS sleep during trading
./client/scripts/prevent-sleep.sh
```

## 📈 Performance & Monitoring

### Built-in Analytics
- **Trade Performance** - Win/loss ratios, P&L tracking
- **Pattern Success Rates** - Historical pattern performance
- **Risk Metrics** - Maximum drawdown, Sharpe ratio
- **Daily Reports** - Automated performance summaries

### Health Monitoring
- **Health Endpoint** - `/health` for uptime monitoring
- **System Metrics** - CPU, memory, disk usage
- **API Connectivity** - Real-time connection status
- **Error Tracking** - Comprehensive error logging

## 🔒 Security & Compliance

### API Security
- **Environment Variables** - No hardcoded credentials
- **Secure Key Storage** - Encrypted configuration
- **Rate Limiting** - Respects API limits
- **Paper Trading Default** - Safe testing environment

### Legal Compliance
- **SEC Compliant** - Follows US trading regulations
- **Risk Disclaimers** - Comprehensive warnings
- **Audit Trail** - Complete trade logging
- **Cloud Provider ToS** - Verified compliance

## 📚 Documentation

- **[Quick Start Guide](RAILWAY_QUICK_START.md)** - 5-minute Railway deployment
- **[Full Deployment Guide](RAILWAY_DEPLOYMENT_GUIDE.md)** - Comprehensive cloud setup
- **[Trading System Guide](TRADING_SYSTEM_GUIDE.md)** - Strategy documentation
- **[Pattern Analysis Guide](PATTERN_ANALYSIS_GUIDE.md)** - Technical analysis
- **[Email/SMS Setup](EMAIL_SMS_SETUP_GUIDE.md)** - Notification configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Risk Disclaimer

**Trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. This software is provided for educational purposes only. Always trade with money you can afford to lose.**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/AlpacaBot/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/AlpacaBot/discussions)
- **Email:** your-email@example.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/AlpacaBot&type=Date)](https://star-history.com/#YOUR_USERNAME/AlpacaBot&Date)

---

**Made with ❤️ for the trading community**

*Deploy to Railway for free: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)*
