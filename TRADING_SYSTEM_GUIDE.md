# 🎯 AlpacaBot Trading System - Complete Guide

## 📈 **TRADING STRATEGY OVERVIEW**

**Strategy**: Ross Cameron Momentum Trading  
**Style**: Intraday penny stock scalping  
**Target**: 15-40% gains per trade  
**Risk Level**: High risk, high reward  
**Allocation**: 100% account deployment  

---

## 🕐 **TRADING SESSIONS**

### 🌅 **PRE-MARKET (4:00 AM - 9:30 AM ET)**

**Screening Criteria:**
- Price Range: $0.50 - $20.00
- Minimum Gain: +15% from previous close
- Minimum Volume: 50,000 shares
- Penny stock focus list (40+ tickers)

**Technical Requirements (ALL MUST BE TRUE):**
1. ✅ Price > VWAP (momentum confirmation)
2. ✅ Price > 9-EMA (short-term bullish)
3. ✅ 9-EMA > 20-EMA (trend alignment)
4. ✅ 20-EMA > 200-EMA (long-term uptrend)
5. 🚨 **MACD BULLISH** (CRITICAL: MACD > Signal + Positive Histogram)

**Buy Parameters:**
- Order Type: Limit orders
- Price: Current price + 0.2% buffer
- Extended Hours: Enabled
- Position Size: Account value ÷ qualifying stocks

**Exit Strategy:**
- 25% at +10% profit
- 25% at +20% profit  
- 25% at +30% profit
- 25% at +40% profit
- Immediate exit if MACD turns bearish

### 🌞 **MARKET HOURS (9:30 AM - 4:00 PM ET)**

**Screening Criteria:**
- Same price range and gain requirements
- Higher volume threshold: 100,000 shares
- Same penny stock universe

**Technical Requirements:**
- Identical 5-point technical confluence
- MACD bullish filter remains critical

**Buy Parameters:**
- Order Type: Market orders (faster execution)
- Position Size: Same 100% allocation strategy
- Extended Hours: Disabled

**Exit Strategy:**
- Same profit targets
- More aggressive MACD monitoring
- Faster exit execution

---

## 💰 **POSITION MANAGEMENT**

### **100% Account Allocation Strategy**
```
Example with $10,000 account:
- 4 qualifying stocks found
- $2,500 allocated per stock
- If AAPL = $150/share → Buy 16 shares = $2,400
```

### **Risk Management**
- **Stop Loss**: 5% trailing stop
- **Technical Exit**: MACD reversal
- **Time Exit**: End of session (4:00 PM)
- **Maximum Holdings**: No overnight positions

---

## 🔧 **SYSTEM ARCHITECTURE**

### **Core Files:**
- `server/index.js` - Main server with scheduling
- `server/tradingBot.js` - Trading bot orchestrator
- `server/emailSMSService.js` - SMS notifications via email
- `python_scripts/run_premarket_screener.py` - Pre-market scanner
- `python_scripts/run_market_hours_screener.py` - Market hours scanner
- `python_scripts/execute_trades.py` - Trade execution engine
- `python_scripts/monitor_positions.py` - Position monitoring
- `python_scripts/close_all_positions.py` - Emergency position closure

### **Configuration:**
- `.env` - Environment variables and API keys
- `config.py` - Python trading configuration
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies

---

## 📱 **NOTIFICATIONS**

### **SMS Alerts via Email-to-SMS (FREE):**
- 🌅 Bot start notifications (4:00 AM)
- 🟢 Buy order confirmations (symbol, shares, price, value)
- 🔴 Sell order confirmations (symbol, shares, price, P&L, win/loss)
- 📊 Daily summary (4:00 PM with stats)
- ⚠️ Error alerts and system issues

### **Email Configuration:**
- Provider: Gmail with app password
- Carrier Gateway: Verizon (8139812277@vtext.com)
- Cost: $0 (completely free)

---

## 🎯 **TRADING CRITERIA BREAKDOWN**

### **Stock Selection (Ross Cameron Method):**
1. **Gap Up**: Stock must be up 15%+ from previous close
2. **Price Range**: $0.50 - $20.00 (sweet spot: $1-$10)
3. **Volume**: Sufficient liquidity for quick entry/exit
4. **Float**: Prefer smaller float for volatility
5. **News/Catalyst**: Often news-driven momentum

### **Technical Confluence (5-Point System):**
1. **VWAP**: Confirms institutional interest
2. **9-EMA**: Short-term momentum direction
3. **20-EMA**: Medium-term trend
4. **200-EMA**: Long-term market context
5. **MACD**: Momentum oscillator (CRITICAL FILTER)

### **Why MACD is Critical:**
- MACD crossover indicates momentum shift
- Positive histogram shows strengthening momentum
- If MACD turns bearish, momentum is exhausted
- Non-negotiable exit signal

---

## 🚨 **RISK WARNINGS**

### **High-Risk Strategy:**
- ⚠️ Can lose 100% of trade value quickly
- ⚠️ Penny stocks are highly volatile
- ⚠️ News can cause instant reversals
- ⚠️ Pre-market has lower liquidity
- ⚠️ 100% allocation means high exposure

### **Risk Mitigation:**
- ✅ Strict technical filters (5-point confluence)
- ✅ Automated MACD exit triggers
- ✅ Professional position sizing
- ✅ No overnight holdings
- ✅ Real-time monitoring and alerts

---

## 📊 **EXPECTED PERFORMANCE**

### **Typical Trading Day:**
- 2-8 qualifying stocks found
- 60-75% win rate target
- Average win: +15-25%
- Average loss: -3-7%
- Total trades: 4-12 per day

### **Performance Metrics:**
- Daily P&L tracking
- Win/loss ratio monitoring
- Volume and execution analysis
- MACD signal effectiveness

---

## 🔄 **DAILY WORKFLOW**

### **4:00 AM ET - Pre-Market Start:**
1. System automatically starts
2. Scans 40+ penny stocks
3. Applies 5-point technical filter
4. Executes trades on qualifying stocks
5. Sets profit targets and stops
6. Sends SMS confirmation

### **9:30 AM ET - Market Hours Start:**
1. Scans for additional opportunities
2. May add new positions
3. Continues monitoring existing positions
4. Executes MACD-triggered exits

### **4:00 PM ET - Market Close:**
1. Closes all remaining positions
2. Generates daily report
3. Sends SMS summary
4. Prepares for next trading day

---

## 🎉 **SYSTEM STATUS: FULLY OPERATIONAL**

✅ **Automated Scheduling**: 4 AM - 4 PM ET  
✅ **Technical Analysis**: 5-point confluence system  
✅ **Risk Management**: MACD-based exits  
✅ **SMS Notifications**: Free email-to-SMS  
✅ **Position Sizing**: Professional allocation  
✅ **Real-time Monitoring**: Live dashboard  
✅ **Trade Logging**: Analytics and charts  

**Your AlpacaBot is ready for high-momentum penny stock trading! 🚀📱💰**
