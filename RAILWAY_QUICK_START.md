# 🚂 Railway.app Deployment - Quick Start Checklist

## 📋 Pre-Deployment Checklist

**Before deploying to Railway, ensure you have:**

- [ ] **Alpaca API Keys Ready**
  - Paper trading: Get keys from https://app.alpaca.markets/paper/dashboard/overview
  - Live trading: Get keys from https://app.alpaca.markets/brokerage/dashboard/overview

- [ ] **GitHub Account**
  - Repository will need to be public for Railway free tier
  - Private repos require Railway Pro plan

- [ ] **Test Locally First**
  - Run `./test-railway-deployment.sh` to verify everything works
  - Ensure your bot connects to Alpaca API successfully

## 🚀 5-Minute Railway Deployment

### Step 1: Create Deployment Package (2 minutes)
```bash
cd /Users/dionc/Desktop/AlpacaBot
./package-for-railway.sh
```

### Step 2: GitHub Upload (2 minutes)
```bash
# Navigate to the created package
cd /tmp/alpacabot-railway-*

# Create and push to GitHub
git init
git add .
git commit -m "AlpacaBot Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alpacabot-railway.git
git push -u origin main
```

### Step 3: Railway Deployment (1 minute)
1. Go to https://railway.app
2. Login with GitHub
3. "New Project" → "Deploy from GitHub"
4. Select your `alpacabot-railway` repo
5. Click "Deploy"

### Step 4: Add Environment Variables
In Railway dashboard, add these variables:
```
ALPACA_API_KEY=PKXXXXXXXXXXXXXXXXXXXXX
ALPACA_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ALPACA_BASE_URL=https://paper-api.alpaca.markets
PORT=3001
NODE_ENV=production
```

### Step 5: Verify Deployment
- Visit your Railway URL (e.g., `https://yourapp.railway.app`)
- Check `/health` endpoint: `https://yourapp.railway.app/health`
- Verify your trading interface loads

## 🎯 Your Bot URLs

After deployment, your bot will be available at:
- **Main Interface:** `https://yourapp.railway.app`
- **Health Check:** `https://yourapp.railway.app/health`
- **API Status:** `https://yourapp.railway.app/api/status`

## 💰 Cost Breakdown

**Railway Starter (FREE):**
- $5/month credits included
- AlpacaBot typically uses $2-4/month
- No credit card required
- 24/7 uptime (no sleeping!)

## 📊 Monitoring Your Bot

**Railway Dashboard provides:**
- ✅ Real-time logs
- ✅ CPU/Memory metrics
- ✅ Deployment history
- ✅ Automatic SSL
- ✅ Custom domains

## 🔧 Environment Variables Reference

### Required:
```bash
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets  # or live URL
```

### Optional (Email/SMS Alerts):
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### System:
```bash
PORT=3001                    # Railway sets this automatically
NODE_ENV=production          # For production optimizations
TZ=America/New_York         # Trading timezone
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Build failed"**
   - Check Railway build logs
   - Verify all dependencies in package.json and requirements.txt

2. **"Application error"**
   - Check Railway application logs
   - Verify environment variables are set correctly
   - Test API key connectivity

3. **"Cannot connect to Alpaca"**
   - Verify API keys are correct
   - Check ALPACA_BASE_URL is set properly
   - Ensure you're using paper trading keys if testing

4. **"Health check failing"**
   - Verify `/health` endpoint returns 200 status
   - Check server startup logs for errors

### Getting Help:

- **Railway Discord:** https://discord.gg/railway
- **Railway Docs:** https://docs.railway.app
- **Alpaca API Docs:** https://alpaca.markets/docs/

## ✅ Success Indicators

Your deployment is successful when:
- [ ] Railway URL loads your bot interface
- [ ] Health endpoint returns JSON with bot status
- [ ] No errors in Railway logs
- [ ] Bot connects to Alpaca API successfully
- [ ] Trading functions work as expected

## 🎉 You're Live!

**Congratulations!** Your AlpacaBot is now:
- ✅ Running 24/7 on Railway
- ✅ Accessible worldwide via HTTPS
- ✅ Automatically deploying from GitHub
- ✅ Completely FREE (within $5/month credits)
- ✅ Monitored with professional tools

**Next Steps:**
- Set up email/SMS alerts for trading events
- Consider adding a custom domain
- Monitor your bot's performance in Railway dashboard
- Join the Railway community for tips and updates

---

**📖 Full Documentation:** See `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed instructions

**🚀 Happy Trading!** Your bot is now running in the cloud!
