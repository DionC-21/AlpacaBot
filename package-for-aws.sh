#!/bin/bash

# AlpacaBot AWS Deployment Package Creator
# Creates a deployment-ready package for AWS EC2

echo "☁️ Creating AlpacaBot AWS Deployment Package"
echo "============================================"

PACKAGE_NAME="alpacabot-aws-$(date +%Y%m%d-%H%M%S)"
PACKAGE_DIR="/tmp/$PACKAGE_NAME"

# Create package directory
mkdir -p "$PACKAGE_DIR"

echo "📁 Copying files for AWS deployment..."

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
cp *.csv "$PACKAGE_DIR/" 2>/dev/null && echo "ℹ️  CSV files copied" || echo "ℹ️  No CSV files found"

# Copy documentation
cp *.md "$PACKAGE_DIR/" 2>/dev/null || echo "ℹ️  No markdown files found"

# Create AWS-specific package.json
cat > "$PACKAGE_DIR/package.json" << 'EOF'
{
  "name": "alpacabot-aws",
  "version": "1.0.0",
  "description": "AlpacaBot Trading System - AWS Deployment",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "aws-deploy": "pm2 start ecosystem.config.js",
    "aws-stop": "pm2 stop all",
    "aws-restart": "pm2 restart all",
    "aws-logs": "pm2 logs"
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
    "aws-sdk": "^2.1400.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "keywords": ["trading", "bot", "alpaca", "aws", "fintech"],
  "license": "MIT"
}
EOF

# Create AWS-optimized ecosystem.config.js
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
        PORT: 3001,
        AWS_REGION: process.env.AWS_REGION || 'us-east-1'
      },
      error_file: './logs/server-err.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s'
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
      env: {
        PYTHONUNBUFFERED: '1',
        AWS_REGION: process.env.AWS_REGION || 'us-east-1'
      },
      error_file: './logs/trading-err.log',
      out_file: './logs/trading-out.log',
      log_file: './logs/trading-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# Create AWS deployment instructions
cat > "$PACKAGE_DIR/AWS_DEPLOY.md" << 'EOF'
# AlpacaBot AWS Deployment Guide

## 🚀 Quick Start

### 1. Launch EC2 Instance
1. Go to AWS Console → EC2
2. Launch Instance:
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t3.micro (free tier) or t3.small
   - **Key Pair**: Create new or use existing
   - **Security Group**: Allow SSH (22) and HTTP (3001)

### 2. Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 3. Upload Files
```bash
# From your local machine
scp -i your-key.pem -r . ubuntu@your-ec2-public-ip:~/alpacabot/
```

### 4. Run Setup Script
```bash
# On EC2 instance
cd ~/alpacabot
chmod +x deploy-aws-ec2.sh
./deploy-aws-ec2.sh
```

### 5. Install Dependencies
```bash
npm install
pip3 install -r requirements.txt
```

### 6. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key, Secret Key, Region
```

### 7. Start Trading Bot
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔧 Configuration

### Environment Variables
Edit your config.py or set environment variables:
- `ALPACA_API_KEY`
- `ALPACA_SECRET_KEY`
- `AWS_REGION`

### Security Groups
Ensure these ports are open:
- **22**: SSH access
- **3001**: Web interface
- **443**: HTTPS (if using SSL)

## 📊 Monitoring

### CloudWatch Logs
Your logs will be sent to CloudWatch:
- Log Group: `alpacabot-server`
- Log Group: `alpacabot-trading`

### PM2 Commands
```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart all         # Restart services
pm2 stop all           # Stop services
pm2 monit              # Real-time monitoring
```

### System Health
```bash
htop                    # System resources
sudo systemctl status alpacabot  # Service status
```

## 🌐 Access Your Bot
- Web Interface: `http://YOUR_EC2_IP:3001`
- SSH Access: `ssh -i key.pem ubuntu@YOUR_EC2_IP`

## 💰 Cost Optimization
- Use **t3.micro** for free tier
- Stop instance when not trading
- Use **Spot Instances** for cost savings
- Enable **Auto Scaling** for high availability

## 🚨 Troubleshooting
- Check security groups if can't connect
- Verify IAM permissions for CloudWatch
- Check logs: `pm2 logs` or `sudo journalctl -u alpacabot`
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
boto3==1.28.25
psutil==5.9.5
EOF
    echo "✅ Created requirements.txt"
fi

# Create logs directory
mkdir -p "$PACKAGE_DIR/logs"

# Copy the AWS deployment script
cp deploy-aws-ec2.sh "$PACKAGE_DIR/" 2>/dev/null || echo "⚠️  deploy-aws-ec2.sh not found"

# Create archive
cd /tmp
tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"

echo ""
echo "✅ AWS deployment package created!"
echo "📦 Package: /tmp/$PACKAGE_NAME.tar.gz"
echo "📁 Size: $(du -h /tmp/$PACKAGE_NAME.tar.gz | cut -f1)"
echo ""
echo "🚀 Next Steps:"
echo "1. Launch EC2 instance (Ubuntu 22.04 LTS)"
echo "2. Upload package: scp -i key.pem /tmp/$PACKAGE_NAME.tar.gz ubuntu@server:~/"
echo "3. Extract: tar -xzf $PACKAGE_NAME.tar.gz"
echo "4. Deploy: cd $PACKAGE_NAME && ./deploy-aws-ec2.sh"
echo ""
echo "💡 Cost: ~$8-15/month for t3.micro instance"
echo "🎯 Your bot will run 24/7 on AWS!"
