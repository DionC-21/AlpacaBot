#!/bin/bash

# AlpacaBot Railway Deployment Test Script
# Test your bot locally before deploying to Railway

echo "🧪 Testing AlpacaBot for Railway Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "📋 Pre-deployment checklist:"
echo ""

# Check if we're in the right directory
if [ ! -f "config.py" ] || [ ! -d "server" ]; then
    echo -e "${RED}❌ Please run this script from the AlpacaBot root directory${NC}"
    exit 1
fi

# Check required files
echo "🔍 Checking required files..."
files_to_check=("config.py" "requirements.txt" "server/index.js" "ross_cameron_pattern_trader.py")
missing_files=0

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file exists"
    else
        print_status 1 "$file missing"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    echo -e "${RED}❌ $missing_files required files are missing${NC}"
    exit 1
fi

# Check Node.js dependencies
echo ""
echo "📦 Checking Node.js dependencies..."
cd server
if [ -f "package.json" ]; then
    if npm list express socket.io cors body-parser >/dev/null 2>&1; then
        print_status 0 "Node.js dependencies installed"
    else
        print_warning "Some Node.js dependencies missing - run 'npm install' in server directory"
    fi
else
    print_warning "No package.json found in server directory"
fi
cd ..

# Check Python dependencies
echo ""
echo "🐍 Checking Python dependencies..."
if command -v python3 >/dev/null 2>&1; then
    print_status 0 "Python3 available"
    
    # Check if alpaca-trade-api is available
    if python3 -c "import alpaca_trade_api" >/dev/null 2>&1; then
        print_status 0 "alpaca-trade-api installed"
    else
        print_warning "alpaca-trade-api not installed - run 'pip install -r requirements.txt'"
    fi
    
    # Check if pandas is available
    if python3 -c "import pandas" >/dev/null 2>&1; then
        print_status 0 "pandas installed"
    else
        print_warning "pandas not installed - run 'pip install -r requirements.txt'"
    fi
else
    print_status 1 "Python3 not found"
fi

# Check environment variables
echo ""
echo "🔑 Checking environment configuration..."
if [ -f ".env" ]; then
    print_status 0 ".env file exists"
    
    # Check for required variables
    if grep -q "ALPACA_API_KEY" .env; then
        print_status 0 "ALPACA_API_KEY configured"
    else
        print_warning "ALPACA_API_KEY not found in .env"
    fi
    
    if grep -q "ALPACA_SECRET_KEY" .env; then
        print_status 0 "ALPACA_SECRET_KEY configured"
    else
        print_warning "ALPACA_SECRET_KEY not found in .env"
    fi
else
    print_warning ".env file not found - create one with your API keys"
fi

# Test server startup
echo ""
echo "🚀 Testing server startup..."
cd server

# Start server in background and test health endpoint
node index.js &
SERVER_PID=$!
sleep 3

# Test health endpoint
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    print_status 0 "Server starts successfully"
    print_status 0 "Health endpoint responds"
else
    print_status 1 "Server failed to start or health endpoint not responding"
fi

# Clean up
kill $SERVER_PID >/dev/null 2>&1
cd ..

echo ""
echo "📊 Test Summary:"
echo "================"

# Final recommendations
echo ""
echo "🚂 Railway Deployment Readiness:"
if [ $missing_files -eq 0 ]; then
    echo -e "${GREEN}✅ Your bot is ready for Railway deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run './package-for-railway.sh' to create deployment package"
    echo "2. Create GitHub repository with the package"
    echo "3. Deploy to Railway from GitHub"
    echo "4. Add environment variables in Railway dashboard"
    echo ""
    echo "📖 Full guide: RAILWAY_DEPLOYMENT_GUIDE.md"
else
    echo -e "${RED}❌ Fix the issues above before deploying${NC}"
fi

echo ""
echo "💡 Pro tips for Railway deployment:"
echo "- Use environment variables for API keys (never commit them)"
echo "- Test locally first with the same environment variables"
echo "- Monitor Railway logs after deployment"
echo "- Railway auto-detects Node.js and Python"
echo ""
echo "🎯 Railway will run your bot 24/7 for FREE!"
