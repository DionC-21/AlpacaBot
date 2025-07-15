# 🚀 AlpacaBot AWS Deployment Guide

## Step-by-Step AWS Setup

### 1. 📦 Create Deployment Package
```bash
cd /Users/dionc/Desktop/AlpacaBot
./package-for-aws.sh
```

### 2. ☁️ Launch AWS EC2 Instance

#### Via AWS Console:
1. **Go to**: https://console.aws.amazon.com/ec2/
2. **Click**: "Launch Instance"
3. **Choose**:
   - **Name**: `AlpacaBot-Trading-Server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: t3.micro (Free tier) or t3.small ($15/month)
   - **Key Pair**: Create new or select existing
   - **Security Group**: 
     - SSH (22) - Your IP only
     - Custom TCP (3001) - Anywhere (0.0.0.0/0)

#### Via AWS CLI (Alternative):
```bash
# Install AWS CLI
brew install awscli

# Configure credentials
aws configure

# Launch instance
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --count 1 \
  --instance-type t3.micro \
  --key-name your-key-name \
  --security-group-ids sg-your-security-group
```

### 3. 📤 Upload Your Bot to AWS
```bash
# Get your package
PACKAGE=$(ls /tmp/alpacabot-aws-*.tar.gz | head -1)
echo "Package: $PACKAGE"

# Upload to EC2 (replace with your details)
scp -i ~/path/to/your-key.pem "$PACKAGE" ubuntu@YOUR_EC2_IP:~/

# Connect to EC2
ssh -i ~/path/to/your-key.pem ubuntu@YOUR_EC2_IP
```

### 4. 🔧 Set Up on EC2
```bash
# On EC2 instance
cd ~
tar -xzf alpacabot-aws-*.tar.gz
cd alpacabot-aws-*

# Run setup script
chmod +x deploy-aws-ec2.sh
./deploy-aws-ec2.sh

# Install dependencies
npm install
pip3 install -r requirements.txt
```

### 5. ⚙️ Configure Your Bot
```bash
# Edit configuration
nano config.py

# Add your API keys:
# ALPACA_API_KEY = "your_key_here"
# ALPACA_SECRET_KEY = "your_secret_here"
```

### 6. 🚀 Start Trading!
```bash
# Start the bot
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs
```

### 7. 🌐 Access Your Bot
- **Web Interface**: `http://YOUR_EC2_PUBLIC_IP:3001`
- **SSH Access**: `ssh -i key.pem ubuntu@YOUR_EC2_IP`

## 💰 Cost Breakdown

### Free Tier (12 months):
- **t3.micro**: Free for 750 hours/month
- **Storage**: 30GB EBS free
- **Data Transfer**: 15GB/month free

### After Free Tier:
- **t3.micro**: ~$8/month
- **t3.small**: ~$15/month (recommended for active trading)
- **Storage**: ~$3/month for 30GB
- **Data Transfer**: Minimal for trading bots

## 📊 Monitoring & Logs

### CloudWatch Integration:
- Automatic log collection
- Real-time monitoring
- Alerting capabilities
- Cost: ~$1-2/month

### PM2 Dashboard:
```bash
pm2 monit    # Real-time monitoring
pm2 logs     # View all logs
pm2 status   # Check process status
```

## 🔒 Security Best Practices

1. **Security Groups**: Only allow your IP for SSH
2. **Key Management**: Use strong SSH keys
3. **API Keys**: Store in environment variables
4. **Updates**: Keep system updated
5. **Backups**: Regular EBS snapshots

## 🚨 Emergency Commands

```bash
# Stop all trading immediately
pm2 stop all

# Emergency shutdown
sudo shutdown -h now

# Check system resources
htop
df -h
```

## 📞 Support

If you need help:
1. Check PM2 logs: `pm2 logs`
2. Check system logs: `sudo journalctl -u alpacabot`
3. Check AWS CloudWatch logs
4. Verify security group settings

Your AlpacaBot will now run 24/7 on AWS! 🎉
