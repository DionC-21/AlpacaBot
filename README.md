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
