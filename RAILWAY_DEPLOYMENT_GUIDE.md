# 🚂 AlpacaBot Railway.app Deployment Guide

Deploy your AlpacaBot to Railway.app for **FREE 24/7 operation** - no credit card required!

## 🌟 Why Railway.app?

- ✅ **Truly FREE** - $5/month credits included (no card needed)
- ✅ **No sleeping** - Your bot runs 24/7 (unlike Heroku free tier)
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **Zero maintenance** - Railway manages the infrastructure
- ✅ **GitHub integration** - Deploy directly from your repo
- ✅ **Built-in monitoring** - Logs and metrics included

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] GitHub account
- [ ] Alpaca API keys (paper or live trading)
- [ ] Your AlpacaBot code ready

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Deployment Package

Run the Railway packaging script to prepare your code:

```bash
cd /Users/dionc/Desktop/AlpacaBot
./package-for-railway.sh
```

This creates a Railway-optimized package with:
- ✅ Server configuration
- ✅ Python dependencies
- ✅ Railway-specific configs (railway.json, Procfile)
- ✅ Environment template
- ✅ Health check endpoint

### Step 2: Create GitHub Repository

1. **Extract the package:**
   ```bash
   cd /tmp
   tar -xzf alpacabot-railway-*.tar.gz
   cd alpacabot-railway-*
   ```

2. **Create new GitHub repo:**
   - Go to https://github.com/new
   - Repository name: `alpacabot-railway`
   - Set to **Public** (required for free Railway)
   - Click "Create repository"

3. **Upload your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial AlpacaBot Railway deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/alpacabot-railway.git
   git push -u origin main
   ```

### Step 3: Create Railway Account

1. **Sign up at Railway:**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Choose "Login with GitHub"
   - Authorize Railway to access your GitHub

2. **No credit card required!** 
   - You get $5/month in free credits
   - Perfect for running trading bots

### Step 4: Deploy Your Bot

1. **Start deployment:**
   - In Railway dashboard, click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `alpacabot-railway` repository
   - Click "Deploy Now"

2. **Railway auto-detection:**
   - Railway detects Node.js and Python
   - Automatically installs dependencies
   - Uses the start command from package.json

3. **Monitor deployment:**
   - Watch the build logs in real-time
   - Deployment typically takes 2-3 minutes
   - Look for "Build successful" message

### Step 5: Configure Environment Variables

**Critical:** Add your API keys and configuration:

1. **In Railway dashboard:**
   - Go to your project
   - Click "Variables" tab
   - Add the following variables:

   ```
   ALPACA_API_KEY=PKXXXXXXXXXXXXXXXXXXXXX
   ALPACA_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ALPACA_BASE_URL=https://paper-api.alpaca.markets
   PORT=3001
   NODE_ENV=production
   ```

2. **Optional variables (for email/SMS):**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

3. **Click "Deploy" after adding variables**

### Step 6: Access Your Bot

1. **Get your Railway URL:**
   - In the Railway dashboard
   - Your app gets a URL like: `https://alpacabot-railway-production.up.railway.app`
   - Click the URL to open your bot

2. **Test functionality:**
   - Your AlpacaBot interface should load
   - All trading controls should be functional
   - Check that API connections work

### Step 7: Set Up Custom Domain (Optional)

1. **Add custom domain:**
   - Go to "Settings" → "Domains"
   - Add your domain (e.g., `mybot.example.com`)
   - Railway provides automatic SSL certificates

2. **DNS configuration:**
   - Point your domain to Railway's provided CNAME
   - SSL is handled automatically

## 📊 Monitoring Your Bot

### Railway Dashboard Features:

1. **Logs:**
   - Real-time application logs
   - Filter by log level
   - Search through historical logs

2. **Metrics:**
   - CPU usage
   - Memory consumption
   - Network traffic
   - Response times

3. **Deployments:**
   - Track deployment history
   - Rollback to previous versions
   - GitHub commit integration

### Health Check:

Your bot includes a health endpoint:
```
GET https://your-app.railway.app/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "alpacabot",
  "uptime": 3600
}
```

## 💰 Free Tier Details

Railway's **Starter Plan** (FREE):
- **$5/month credits** (automatically applied)
- **512MB RAM** (sufficient for trading bots)
- **Shared CPU** 
- **100GB bandwidth/month**
- **No sleeping** - Your bot runs 24/7!
- **Automatic deployments** from GitHub

**Cost breakdown for AlpacaBot:**
- Typical usage: $2-4/month
- Well within the free $5 credit!

## 🔄 Auto-Deployment Setup

Enable automatic deployments:

1. **In Railway dashboard:**
   - Go to "Settings" → "Service"
   - Enable "Auto Deploy"
   - Choose branch: `main`

2. **Now every GitHub push automatically deploys!**
   ```bash
   git add .
   git commit -m "Update trading strategy"
   git push
   # Railway automatically redeploys your bot!
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check Railway build logs
   - Verify `package.json` and `requirements.txt`
   - Ensure all dependencies are listed

2. **App crashes:**
   - Check application logs in Railway
   - Verify environment variables are set
   - Test API key connectivity

3. **Port errors:**
   - Railway automatically assigns PORT
   - Use `process.env.PORT || 3001` in your code

4. **Python script errors:**
   - Ensure `requirements.txt` includes all dependencies
   - Check Python version compatibility

### Getting Help:

- **Railway Discord:** https://discord.gg/railway
- **Documentation:** https://docs.railway.app
- **Status page:** https://status.railway.app

## 🎯 Post-Deployment Checklist

- [ ] ✅ Bot is accessible via Railway URL
- [ ] ✅ Trading interface loads correctly
- [ ] ✅ API connections are working
- [ ] ✅ Environment variables are set
- [ ] ✅ Logs show no errors
- [ ] ✅ Health check endpoint responds
- [ ] ✅ Auto-deployment is enabled
- [ ] ✅ Custom domain configured (optional)

## 🌟 Success!

Your AlpacaBot is now running 24/7 on Railway for **FREE**! 

Key benefits:
- 🚀 **Always running** - No sleeping/wake-up delays
- 💰 **Truly free** - $5 credits cover typical usage
- 🔄 **Auto-updates** - Push to GitHub = instant deployment
- 📊 **Professional monitoring** - Built-in logs and metrics
- 🌐 **Global CDN** - Fast worldwide access
- 🔒 **Secure** - Automatic SSL and security updates

## 📞 Need Help?

If you encounter any issues:

1. **Check Railway logs** - Most issues are visible in logs
2. **Verify environment variables** - Missing API keys cause most problems
3. **Test locally first** - Ensure your bot works locally
4. **Railway Discord** - Active community support

---

**🎉 Congratulations! Your AlpacaBot is now running in the cloud for free!**

*Next: Consider setting up email/SMS alerts for important trading events.*
