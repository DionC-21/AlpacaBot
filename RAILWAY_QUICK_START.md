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

## 🚀 Complete Railway Deployment Process (10 minutes)

### Step 1: Create Deployment Package (2 minutes)

**If you're getting build errors, use the minimal package:**
```bash
cd /Users/dionc/Desktop/AlpacaBot
./package-for-railway-minimal.sh
```

**Or use the standard package:**
```bash
cd /Users/dionc/Desktop/AlpacaBot
./package-for-railway.sh
```

### Step 2: GitHub Setup (3 minutes)

#### Option A: Create New Repository (Recommended)
1. **Create repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `alpacabot-railway`
   - Set to **Public** (required for Railway free tier)
   - Don't initialize with README, .gitignore, or license
   - Click "Create repository"

2. **Upload your package:**
```bash
# Navigate to the created package (use the actual folder name)
cd /tmp/alpacabot-railway-clean-*  # or alpacabot-railway-* for standard

# Initialize git and push
git init
git add .
git commit -m "Initial AlpacaBot Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alpacabot-railway.git
git push -u origin main
```

#### Option B: Use Existing Repository
```bash
# If you already have the repository
cd /tmp/alpacabot-railway-*
git init
git add .
git commit -m "Update AlpacaBot for Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
git push -u origin main
```

**⚠️ Important Notes:**
- Replace `YOUR_USERNAME` with your actual GitHub username
- Repository must be **public** for Railway free tier
- Private repositories require Railway Pro ($5/month)

### Step 3: Railway Deployment (2 minutes)

1. **Create Railway Account:**
   - Go to https://railway.app
   - Click "Login with GitHub"
   - Authorize Railway to access your GitHub account

2. **Deploy your repository:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `alpacabot-railway` repository
   - Click "Deploy Now"

3. **Monitor the build:**
   - Railway will automatically detect Node.js and Python
   - Watch the deployment logs for any errors
   - Build should complete in 2-3 minutes

**✅ Success indicators:**
- Build completes without errors
- "Deploy successful" message appears
- You get a Railway app URL (e.g., `https://yourapp.railway.app`)

### Step 4: Configure Environment Variables (2 minutes)

1. **Access Variables Settings:**
   - In your Railway project dashboard
   - Click on your service (the deployed app)
   - Go to "Variables" tab

2. **Add Required Variables:**
   Click "New Variable" for each:
```
ALPACA_API_KEY=PKXXXXXXXXXXXXXXXXXXXXX
ALPACA_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

3. **Add Optional Variables:**
```
PORT=3001
NODE_ENV=production
TZ=America/New_York
```

4. **Deploy Changes:**
   - Click "Deploy" to restart with new variables
   - Wait for deployment to complete

**🔑 Where to get API keys:**
- **Paper Trading:** https://app.alpaca.markets/paper/dashboard/overview
- **Live Trading:** https://app.alpaca.markets/brokerage/dashboard/overview

### Step 5: Verify Deployment (1 minute)

1. **Test your bot URLs:**
   - **Main Interface:** Visit your Railway URL (e.g., `https://yourapp.railway.app`)
   - **Health Check:** Add `/health` to your URL
   - **API Status:** Add `/api/status` to your URL

2. **Check deployment logs:**
   - In Railway dashboard, go to "Deployments" tab
   - Click on the latest deployment
   - Review logs for any errors

3. **Verify bot functionality:**
   - Trading interface loads properly
   - No JavaScript console errors
   - API connections work
   - Health endpoint returns JSON status

**✅ Your bot is live when:**
- [ ] Railway URL loads without errors
- [ ] Health endpoint returns bot status
- [ ] Trading interface is accessible
- [ ] No critical errors in logs

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

## 🔥 Build Error Fix

**If you're getting "Error creating build plan with Railpack" or build failures:**

### Use the Minimal Package (Recommended)
```bash
./package-for-railway-minimal.sh
```

This creates a clean deployment without conflicting build configurations that Railway's auto-detection can handle perfectly.

### Key Differences:
- ✅ No `nixpacks.toml` (causes conflicts)
- ✅ No `Procfile` (Railway auto-detects)
- ✅ No `railway.json` (unnecessary)
- ✅ Clean `package.json` only
- ✅ Railway handles Node.js + Python automatically

### Common Issues:

1. **"Build failed" / "Error creating build plan with Railpack"**
   - **Solution 1:** Remove conflicting configuration files
     ```bash
     # In your deployed repository, delete these files if they exist:
     rm nixpacks.toml
     rm railway.json
     rm Procfile
     ```
   - **Solution 2:** Use Railway's auto-detection
     - Railway works best with minimal configuration
     - Let Railway auto-detect Node.js and Python
     - Only keep `package.json` and `requirements.txt`

   - **Solution 3:** Create minimal `railway.toml`
     ```toml
     [build]
     builder = "nixpacks"
     
     [deploy]
     startCommand = "node server/index.js"
     healthcheckPath = "/health"
     ```

2. **"Nixpacks build failing"**
   - Remove `nixpacks.toml` file completely
   - Railway's auto-detection works better than custom configs
   - Ensure your `package.json` has a clear `start` script

3. **"Application error"**
   - Check Railway application logs
   - Verify environment variables are set correctly
   - Test API key connectivity

4. **"Cannot connect to Alpaca"**
   - Verify API keys are correct
   - Check ALPACA_BASE_URL is set properly
   - Ensure you're using paper trading keys if testing

5. **"Health check failing"**
   - Verify `/health` endpoint returns 200 status
   - Check server startup logs for errors

### Getting Help:

- **Railway Discord:** https://discord.gg/railway
- **Railway Docs:** https://docs.railway.app
- **Alpaca API Docs:** https://alpaca.markets/docs/

## 🔄 Fix Railway Build Errors - Update Existing Repository

**If you're still getting Railway build errors after following the guide, your existing GitHub repository likely contains conflicting configuration files. Here's how to fix it:**

### Option A: Update Existing Repository (Quick Fix)

1. **Create clean package:**
```bash
cd /Users/dionc/Desktop/AlpacaBot
./package-for-railway-minimal.sh
```

2. **Replace repository contents:**
```bash
# Navigate to the clean package
cd /tmp/alpacabot-railway-clean-*

# Connect to your existing repository
git init
git remote add origin https://github.com/YOUR_USERNAME/alpacabot-railway.git

# Force push the clean version
git add .
git commit -m "Fix Railway build errors - clean deployment package"
git branch -M main
git push -f origin main
```

### Option B: Create New Repository (Fresh Start)

1. **Delete old repository:**
   - Go to your GitHub repository
   - Settings → General → Danger Zone → Delete this repository

2. **Create new repository:**
   - Go to https://github.com/new
   - Repository name: `alpacabot-railway-v2` (or any name)
   - Set to **Public**
   - Click "Create repository"

3. **Deploy clean package:**
```bash
cd /tmp/alpacabot-railway-clean-*
git init
git add .
git commit -m "Clean AlpacaBot Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alpacabot-railway-v2.git
git push -u origin main
```

### ⚠️ Why This Happens
Your original repository likely contains these problematic files:
- `nixpacks.toml` (conflicts with Railway auto-detection)
- `railway.json` (unnecessary and can cause issues)
- `Procfile` (Railway prefers auto-detection)
- Old `package.json` with complex configurations

The clean package removes all these conflicts and lets Railway's auto-detection work perfectly.

## 📚 GitHub Repository Management

### Repository Requirements for Railway
- **Visibility:** Must be **public** for Railway free tier
- **Structure:** Root-level `package.json` and `requirements.txt`
- **Branches:** Railway deploys from `main` branch by default
- **Files:** Include all source code, exclude `node_modules/` and `__pycache__/`

### Common GitHub Issues

#### 1. Repository Not Showing in Railway
**Problem:** Your repo doesn't appear when deploying from GitHub
**Solutions:**
```bash
# Ensure repository is public
# Check GitHub → Settings → General → Repository visibility

# Refresh Railway's GitHub connection
# Railway → Account Settings → Integrations → Reconnect GitHub
```

#### 2. Push Permission Denied
**Problem:** `git push` fails with permission errors
**Solutions:**
```bash
# Use GitHub CLI (recommended)
gh auth login
git push origin main

# Or use personal access token
# GitHub → Settings → Developer settings → Personal access tokens
# Use token as password when prompted
```

#### 3. Large Files Warning
**Problem:** Git rejects large files or repositories
**Solutions:**
```bash
# Remove large files from package
rm -rf logs/
rm -rf __pycache__/
rm -rf node_modules/

# Add to .gitignore
echo "logs/" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "node_modules/" >> .gitignore
```

#### 4. Repository Already Exists
**Problem:** GitHub repo name conflicts
**Solutions:**
```bash
# Option 1: Use different name
git remote set-url origin https://github.com/YOUR_USERNAME/alpacabot-railway-v2.git

# Option 2: Delete existing repo and recreate
# GitHub → Your repo → Settings → Delete this repository
```

### ⚠️ "Repository not found" Error

**If you get "remote: Repository not found" when pushing:**

1. **Verify repository exists:**
   - Go to https://github.com/YOUR_USERNAME/alpacabot-railway
   - If it doesn't exist, create it first

2. **Create repository on GitHub:**
   ```bash
   # Go to https://github.com/new
   # Repository name: alpacabot-railway
   # Set to PUBLIC (required for Railway free tier)
   # Don't initialize with any files
   # Click "Create repository"
   ```

3. **Check your username is correct:**
   ```bash
   git remote -v
   # Should show: https://github.com/YOUR_ACTUAL_USERNAME/alpacabot-railway.git
   ```

4. **Fix remote URL if needed:**
   ```bash
   git remote set-url origin https://github.com/YOUR_CORRECT_USERNAME/alpacabot-railway.git
   git push -f origin main
   ```

5. **Alternative: Use different repository name:**
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/alpacabot-v2.git
   # Then create "alpacabot-v2" repository on GitHub
   git push -f origin main
   ```
### Best Practices
- ✅ Use descriptive commit messages
- ✅ Keep repositories organized and clean
- ✅ Regularly update your deployment
- ✅ Use `.gitignore` for temporary files
- ✅ Document environment variables in README

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
