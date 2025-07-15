#!/bin/bash

# AlpacaBot AWS EC2 Deployment Script
# Sets up your trading bot on an AWS EC2 Ubuntu instance

echo "🤖 AlpacaBot AWS EC2 Setup"
echo "=========================="
echo ""
echo "This script will:"
echo "✅ Install Node.js, Python, and dependencies"
echo "✅ Install PM2 for process management"
echo "✅ Set up your trading bot as a service"
echo "✅ Configure AWS-specific settings"
echo "✅ Set up CloudWatch logging (optional)"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget unzip htop

# Install Node.js (LTS version)
echo "📥 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "🔧 Installing PM2 process manager..."
sudo npm install -g pm2

# Install Python and pip
echo "🐍 Installing Python..."
sudo apt install -y python3 python3-pip python3-venv

# Install AWS CLI
echo "☁️ Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Install CloudWatch agent (optional)
echo "📊 Installing CloudWatch agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

# Create application directory
echo "📁 Creating application directory..."
mkdir -p ~/alpacabot
cd ~/alpacabot

# Create logs directory
mkdir -p logs

# Create PM2 ecosystem file for AWS
cat > ecosystem.config.js << 'EOF'
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
        AWS_REGION: 'us-east-1'
      },
      error_file: './logs/server-err.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
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
        AWS_REGION: 'us-east-1'
      },
      error_file: './logs/trading-err.log',
      out_file: './logs/trading-out.log',
      log_file: './logs/trading-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# Create CloudWatch configuration
cat > cloudwatch-config.json << 'EOF'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ubuntu/alpacabot/logs/server-combined.log",
            "log_group_name": "alpacabot-server",
            "log_stream_name": "{instance_id}",
            "timestamp_format": "%Y-%m-%d %H:%M:%S"
          },
          {
            "file_path": "/home/ubuntu/alpacabot/logs/trading-combined.log",
            "log_group_name": "alpacabot-trading",
            "log_stream_name": "{instance_id}",
            "timestamp_format": "%Y-%m-%d %H:%M:%S"
          }
        ]
      }
    }
  }
}
EOF

# Configure firewall
echo "🔒 Configuring UFW firewall..."
sudo ufw allow ssh
sudo ufw allow 3001/tcp
sudo ufw --force enable

# Set up PM2 to start on boot
echo "🚀 Setting up PM2 startup..."
pm2 startup
echo "⚠️  Run the command that PM2 outputs above!"

# Create systemd service for extra reliability
sudo tee /etc/systemd/system/alpacabot.service > /dev/null << 'EOF'
[Unit]
Description=AlpacaBot Trading System
After=network.target

[Service]
Type=forking
User=ubuntu
WorkingDirectory=/home/ubuntu/alpacabot
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
PIDFile=/home/ubuntu/.pm2/pm2.pid
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "✅ AWS EC2 setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Upload your AlpacaBot files to ~/alpacabot/"
echo "3. Install dependencies: npm install && pip3 install -r requirements.txt"
echo "4. Start your bot: pm2 start ecosystem.config.js"
echo "5. Save PM2 config: pm2 save"
echo "6. Enable systemd service: sudo systemctl enable alpacabot"
echo ""
echo "🔧 Useful Commands:"
echo "• Check status: pm2 status"
echo "• View logs: pm2 logs"
echo "• AWS logs: aws logs describe-log-groups"
echo "• System service: sudo systemctl status alpacabot"
echo ""
echo "🌐 Access your bot: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3001"
echo ""
