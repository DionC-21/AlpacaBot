#!/bin/bash

# AlpacaBot Cloud Deployment Script for Oracle Cloud (Ubuntu)
# This script sets up your trading bot on a free Oracle Cloud VM

echo "🤖 AlpacaBot Cloud Deployment Setup"
echo "===================================="
echo ""
echo "This script will:"
echo "✅ Install Node.js and dependencies"
echo "✅ Install PM2 for process management"
echo "✅ Set up your trading bot as a service"
echo "✅ Configure automatic restart and monitoring"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS version)
echo "📥 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "🔧 Installing PM2 process manager..."
sudo npm install -g pm2

# Install Python and pip (for your Python trading scripts)
echo "🐍 Installing Python..."
sudo apt install -y python3 python3-pip python3-venv

# Create application directory
echo "📁 Creating application directory..."
mkdir -p ~/alpacabot
cd ~/alpacabot

# Create a sample ecosystem file for PM2
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
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
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

# Create logs directory
mkdir -p logs

# Install useful monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt install -y htop ncdu ufw

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 3001/tcp
sudo ufw --force enable

# Set up PM2 to start on boot
echo "🚀 Setting up PM2 startup..."
pm2 startup
# Note: User will need to run the command that PM2 outputs

echo ""
echo "✅ Cloud server setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload your AlpacaBot files to ~/alpacabot/"
echo "2. Install your app dependencies: npm install"
echo "3. Install Python requirements: pip3 install -r requirements.txt"
echo "4. Start your bot: pm2 start ecosystem.config.js"
echo "5. Save PM2 config: pm2 save"
echo ""
echo "🔧 Useful Commands:"
echo "• Check status: pm2 status"
echo "• View logs: pm2 logs"
echo "• Restart: pm2 restart all"
echo "• Stop: pm2 stop all"
echo "• Monitor: pm2 monit"
echo ""
echo "🌐 Your bot will be accessible at: http://YOUR_VM_IP:3001"
echo ""
