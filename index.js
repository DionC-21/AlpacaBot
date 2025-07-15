const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import your existing trading modules
const TradingBot = require('./tradingBot');
const Logger = require('./logger');
const EmailSMSService = require('./emailSMSService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files if build directory exists
const buildPath = path.join(__dirname, 'client', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
} else {
  console.log('Client build directory not found, serving API only');
}

// Initialize trading bot and logger
const logger = new Logger();
const smsService = new EmailSMSService();
const tradingBot = new TradingBot(logger, smsService);

// Bot status
let botStatus = {
  isRunning: false,
  currentSession: 'closed',
  lastUpdate: null,
  positions: [],
  todayPnL: 0,
  accountValue: 0,
  qualifyingStocks: [],
  scheduledJobs: {
    premarket: null,
    market: null,
    cleanup: null,
    minuteScanner: null
  }
};

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send current status to new client with clean object
  const cleanStatus = {
    isRunning: botStatus.isRunning,
    currentSession: botStatus.currentSession,
    lastUpdate: botStatus.lastUpdate,
    positions: botStatus.positions,
    todayPnL: botStatus.todayPnL,
    accountValue: botStatus.accountValue,
    qualifyingStocks: botStatus.qualifyingStocks,
    scheduledJobs: {
      premarket: botStatus.scheduledJobs.premarket ? 'active' : 'inactive',
      market: botStatus.scheduledJobs.market ? 'active' : 'inactive',
      cleanup: botStatus.scheduledJobs.cleanup ? 'active' : 'inactive'
    }
  };
  socket.emit('botStatus', cleanStatus);
  
  // Handle manual bot control
  socket.on('startBot', () => {
    startBotManually();
  });
  
  socket.on('stopBot', () => {
    stopBotManually();
  });
  
  socket.on('closeAllPositions', async () => {
    try {
      await tradingBot.closeAllPositions();
      updateBotStatus();
      socket.emit('message', { type: 'success', text: 'All positions closed' });
    } catch (error) {
      socket.emit('message', { type: 'error', text: `Error closing positions: ${error.message}` });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Broadcast status updates to all clients
function broadcastStatus() {
  // Create a clean status object without circular references
  const cleanStatus = {
    isRunning: botStatus.isRunning,
    currentSession: botStatus.currentSession,
    lastUpdate: botStatus.lastUpdate,
    positions: botStatus.positions,
    todayPnL: botStatus.todayPnL,
    accountValue: botStatus.accountValue,
    qualifyingStocks: botStatus.qualifyingStocks,
    scheduledJobs: {
      premarket: botStatus.scheduledJobs.premarket ? 'active' : 'inactive',
      market: botStatus.scheduledJobs.market ? 'active' : 'inactive',
      cleanup: botStatus.scheduledJobs.cleanup ? 'active' : 'inactive'
    }
  };
  
  io.emit('botStatus', cleanStatus);
}

// Update bot status
async function updateBotStatus() {
  try {
    const account = await tradingBot.getAccount();
    const positionsResult = await tradingBot.getPositions();
    
    botStatus.accountValue = parseFloat(account.portfolio_value);
    botStatus.todayPnL = parseFloat(account.unrealized_pl || 0);
    // Extract positions array from the result object
    botStatus.positions = positionsResult.positions || [];
    botStatus.lastUpdate = new Date().toISOString();
    
    broadcastStatus();
  } catch (error) {
    logger.error('Error updating bot status:', error);
    // Ensure positions is always an array on error
    botStatus.positions = [];
  }
}

// Scheduled job functions
async function runPreMarketScreener() {
  try {
    logger.info('🌅 Starting Pre-Market Screener at 4:00 AM');
    botStatus.isRunning = true;
    botStatus.currentSession = 'premarket';
    startStatusBroadcasting();
    broadcastStatus();
    
    // Send SMS notification for bot start
    await smsService.notifyBotStarted('premarket');
    
    // Run pre-market screening and trading
    const qualifyingStocks = await tradingBot.runPreMarketScreener();
    botStatus.qualifyingStocks = qualifyingStocks;
    
    if (qualifyingStocks.length > 0) {
      logger.info(`Found ${qualifyingStocks.length} qualifying stocks for pre-market`);
      await tradingBot.executePreMarketTrades(qualifyingStocks);
    }
    
    updateBotStatus();
    
  } catch (error) {
    logger.error('Pre-market screener error:', error);
    io.emit('message', { type: 'error', text: `Pre-market error: ${error.message}` });
    
    // Send SMS notification for error
    await smsService.notifyError(error.message, 'Pre-market Screener');
  }
}

async function runMarketHoursScreener() {
  try {
    logger.info('🌞 Starting Market Hours Screener at 9:30 AM');
    botStatus.currentSession = 'market';
    broadcastStatus();
    
    // Send SMS notification for market hours start
    await smsService.notifyBotStarted('market');
    
    // Run market hours screening and trading
    const qualifyingStocks = await tradingBot.runMarketHoursScreener();
    botStatus.qualifyingStocks = [...botStatus.qualifyingStocks, ...qualifyingStocks];
    
    if (qualifyingStocks.length > 0) {
      logger.info(`Found ${qualifyingStocks.length} additional qualifying stocks for market hours`);
      await tradingBot.executeMarketHoursTrades(qualifyingStocks);
    }
    
    updateBotStatus();
    
  } catch (error) {
    logger.error('Market hours screener error:', error);
    io.emit('message', { type: 'error', text: `Market hours error: ${error.message}` });
    
    // Send SMS notification for error
    await smsService.notifyError(error.message, 'Market Hours Screener');
  }
}

async function runMarketCloseCleanup() {
  try {
    logger.info('🔚 Running Market Close Cleanup at 4:00 PM');
    
    // Final status update and cleanup
    await updateBotStatus();
    
    // Generate daily report and stats
    const dailyReport = await tradingBot.generateDailyReport();
    io.emit('dailyReport', dailyReport);
    
    // Get daily trading stats for SMS notification
    const dailyStats = await getDailyTradingStats();
    
    // Send SMS notification for bot stop with daily summary
    await smsService.notifyBotStopped(dailyStats);
    
    botStatus.isRunning = false;
    botStatus.currentSession = 'closed';
    botStatus.qualifyingStocks = [];
    
    stopStatusBroadcasting();
    broadcastStatus();
    
  } catch (error) {
    logger.error('Market close cleanup error:', error);
    
    // Send SMS notification for error
    await smsService.notifyError(error.message, 'Market Close Cleanup');
  }
}

// Helper function to get daily trading statistics
async function getDailyTradingStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const trades = await getTradesFromCSV();
    
    const todayTrades = trades.filter(trade => 
      trade.timestamp.startsWith(today)
    );
    
    const stats = {
      totalTrades: todayTrades.length,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      volume: 0,
      winRate: 0
    };
    
    todayTrades.forEach(trade => {
      if (trade.pnl > 0) stats.winningTrades++;
      else if (trade.pnl < 0) stats.losingTrades++;
      
      stats.totalPnL += trade.pnl || 0;
      stats.volume += trade.value || 0;
    });
    
    stats.winRate = stats.totalTrades > 0 ? 
      (stats.winningTrades / stats.totalTrades) * 100 : 0;
    
    return stats;
  } catch (error) {
    console.error('Error getting daily trading stats:', error);
    return null;
  }
}

// Schedule trading sessions
function setupScheduledJobs() {
  // Pre-market screener - 4:00 AM ET Monday-Friday
  botStatus.scheduledJobs.premarket = cron.schedule('0 4 * * 1-5', runPreMarketScreener, {
    scheduled: true,
    timezone: "America/New_York"
  });
  
  // Market hours screener - 9:30 AM ET Monday-Friday
  botStatus.scheduledJobs.market = cron.schedule('30 9 * * 1-5', runMarketHoursScreener, {
    scheduled: true,
    timezone: "America/New_York"
  });
  
  // Market close cleanup - 4:00 PM ET Monday-Friday
  botStatus.scheduledJobs.cleanup = cron.schedule('0 16 * * 1-5', runMarketCloseCleanup, {
    scheduled: true,
    timezone: "America/New_York"
  });
  
  // Real-time minute scanner - Every minute during trading hours
  botStatus.scheduledJobs.minuteScanner = cron.schedule('* * * * 1-5', runMinuteScanner, {
    scheduled: true,
    timezone: "America/New_York"
  });
  
  logger.info('✅ Scheduled jobs setup complete');
  logger.info('📅 Pre-market: 4:00 AM ET (Mon-Fri)');
  logger.info('📅 Market hours: 9:30 AM ET (Mon-Fri)');
  logger.info('📅 Market close: 4:00 PM ET (Mon-Fri)');
}

// Manual bot control
function startBotManually() {
  const now = moment().tz('America/New_York');
  const hour = now.hour();
  const minute = now.minute();
  
  if (hour >= 4 && hour < 9) {
    botStatus.isRunning = true;
    startStatusBroadcasting();
    runPreMarketScreener();
  } else if (hour === 9 && minute < 30) {
    botStatus.isRunning = true;
    startStatusBroadcasting();
    runPreMarketScreener();
  } else if ((hour === 9 && minute >= 30) || (hour >= 10 && hour < 16)) {
    botStatus.isRunning = true;
    startStatusBroadcasting();
    runMarketHoursScreener();
  } else {
    io.emit('message', { 
      type: 'warning', 
      text: 'Market is closed. Bot will start automatically during trading hours.' 
    });
  }
}

function stopBotManually() {
  botStatus.isRunning = false;
  botStatus.currentSession = 'manual_stop';
  stopStatusBroadcasting();
  broadcastStatus();
  
  logger.info('🛑 Bot manually stopped');
  io.emit('message', { type: 'info', text: 'Bot manually stopped' });
  
  // Send SMS notification for manual stop
  smsService.notifyBotStopped().catch(error => {
    console.error('Failed to send manual stop SMS:', error);
  });
}

// API Routes
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'AlpacaBot Trading System API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health',
      '/api/status',
      '/api/account',
      '/api/positions',
      '/api/orders'
    ]
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'alpacabot',
    uptime: process.uptime(),
    botStatus: {
      isRunning: botStatus.isRunning,
      currentSession: botStatus.currentSession,
      accountValue: botStatus.accountValue,
      positionsCount: botStatus.positions.length
    },
    version: '1.0.0'
  });
});

// API Status endpoint
app.get('/api/status', (req, res) => {
  res.json(botStatus);
});

app.get('/api/account', async (req, res) => {
  try {
    const account = await tradingBot.getAccount();
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/positions', async (req, res) => {
  try {
    const positionsResult = await tradingBot.getPositions();
    // Return just the positions array or the full result depending on client needs
    res.json(positionsResult.positions || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const ordersResult = await tradingBot.getOrders();
    // Return just the orders array or the full result depending on client needs
    res.json(ordersResult.orders || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/start', (req, res) => {
  startBotManually();
  res.json({ message: 'Bot started manually' });
});

app.post('/api/stop', (req, res) => {
  stopBotManually();
  res.json({ message: 'Bot stopped manually' });
});

app.post('/api/close-all-positions', async (req, res) => {
  try {
    await tradingBot.closeAllPositions();
    res.json({ message: 'All positions closed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add auto mode toggle API
app.post('/api/toggle-auto-mode', (req, res) => {
  const { enabled } = req.body;
  
  if (enabled) {
    // Enable automatic scheduling
    setupScheduledJobs();
    logger.info('✅ Automatic scheduling enabled');
    io.emit('message', { 
      type: 'success', 
      text: 'Automatic mode enabled - Bot will start/stop automatically' 
    });
  } else {
    // Disable automatic scheduling
    if (botStatus.scheduledJobs.premarket) {
      botStatus.scheduledJobs.premarket.stop();
      botStatus.scheduledJobs.premarket = null;
    }
    if (botStatus.scheduledJobs.market) {
      botStatus.scheduledJobs.market.stop();
      botStatus.scheduledJobs.market = null;
    }
    if (botStatus.scheduledJobs.cleanup) {
      botStatus.scheduledJobs.cleanup.stop();
      botStatus.scheduledJobs.cleanup = null;
    }
    
    logger.info('🛑 Automatic scheduling disabled');
    io.emit('message', { 
      type: 'warning', 
      text: 'Automatic mode disabled - Use manual controls only' 
    });
  }
  
  res.json({ success: true, autoMode: enabled });
});

// Add endpoint to check if we're in trading hours
app.get('/api/trading-status', (req, res) => {
  const now = moment().tz('America/New_York');
  const hour = now.hour();
  const minute = now.minute();
  const dayOfWeek = now.day();
  
  // Check if it's a weekday (1-5 = Monday-Friday)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  
  let session = 'closed';
  let nextSession = null;
  
  if (isWeekday) {
    if (hour >= 4 && hour < 9) {
      session = 'premarket';
      nextSession = { name: 'market', time: '9:30 AM' };
    } else if (hour === 9 && minute < 30) {
      session = 'premarket';
      nextSession = { name: 'market', time: '9:30 AM' };
    } else if ((hour === 9 && minute >= 30) || (hour >= 10 && hour < 16)) {
      session = 'market';
      nextSession = { name: 'close', time: '4:00 PM' };
    } else if (hour >= 16 && hour < 20) {
      session = 'afterhours';
      nextSession = { name: 'premarket', time: '4:00 AM (next day)' };
    } else {
      session = 'closed';
      nextSession = { name: 'premarket', time: hour < 4 ? '4:00 AM' : '4:00 AM (next day)' };
    }
  } else {
    session = 'closed';
    nextSession = { name: 'premarket', time: 'Monday 4:00 AM' };
  }
  
  res.json({
    currentSession: session,
    nextSession,
    isWeekday,
    currentTime: now.format('h:mm:ss A'),
    timeZone: 'America/New_York'
  });
});

// Continuous monitoring during market hours
let monitoringInterval = null;

function startContinuousMonitoring() {
  if (monitoringInterval) return;
  
  monitoringInterval = setInterval(async () => {
    if (botStatus.isRunning && botStatus.positions.length > 0) {
      try {
        // Monitor MACD and other indicators
        await tradingBot.monitorOpenPositions();
        await updateBotStatus();
      } catch (error) {
        logger.error('Monitoring error:', error);
      }
    }
  }, 60000); // Check every minute
}

function stopContinuousMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

// Real-time status broadcasting
let statusBroadcastInterval = null;

function startStatusBroadcasting() {
  if (statusBroadcastInterval) return;
  
  statusBroadcastInterval = setInterval(() => {
    if (botStatus.isRunning) {
      const now = moment().tz('America/New_York');
      const currentSession = getCurrentSession();
      
      // Emit real-time status update
      io.emit('realtimeStatus', {
        timestamp: now.format('h:mm:ss A'),
        currentSession: currentSession,
        isRunning: botStatus.isRunning,
        secondsUntilNextMinute: 60 - now.seconds(),
        positions: botStatus.positions.length,
        qualifyingStocks: botStatus.qualifyingStocks.length
      });
    }
  }, 1000); // Every second
}

function stopStatusBroadcasting() {
  if (statusBroadcastInterval) {
    clearInterval(statusBroadcastInterval);
    statusBroadcastInterval = null;
  }
}

function getCurrentSession() {
  const now = moment().tz('America/New_York');
  const hour = now.hour();
  const minute = now.minute();
  const dayOfWeek = now.day();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  if (!isWeekday) {
    return 'closed';
  }

  if (hour >= 4 && hour < 9) {
    return 'premarket';
  } else if (hour === 9 && minute < 30) {
    return 'premarket';
  } else if ((hour === 9 && minute >= 30) || (hour >= 10 && hour < 16)) {
    return 'market';
  } else if (hour >= 16 && hour < 20) {
    return 'afterhours';
  } else {
    return 'closed';
  }
}

// Real-time scanning functions
async function runMinuteScanner() {
  try {
    const now = moment().tz('America/New_York');
    const hour = now.hour();
    const minute = now.minute();
    
    // Emit scanner heartbeat
    io.emit('scannerHeartbeat', {
      timestamp: now.format('h:mm:ss A'),
      isActive: botStatus.isRunning,
      session: botStatus.currentSession
    });
    
    // Only scan during trading hours
    if (!botStatus.isRunning) {
      return;
    }
    
    // Determine session and run appropriate scanner
    if (hour >= 4 && hour < 9) {
      // Pre-market session
      await runRealTimePreMarketScan();
    } else if (hour === 9 && minute < 30) {
      // Pre-market session (before 9:30 AM)
      await runRealTimePreMarketScan();
    } else if ((hour === 9 && minute >= 30) || (hour >= 10 && hour < 16)) {
      // Market hours session (9:30 AM - 4:00 PM)
      await runRealTimeMarketScan();
    }
    
  } catch (error) {
    logger.error('Minute scanner error:', error);
    io.emit('scannerError', {
      timestamp: moment().tz('America/New_York').format('h:mm:ss A'),
      error: error.message
    });
  }
}

async function runRealTimePreMarketScan() {
  try {
    logger.info('🔍 Running real-time pre-market scan...');
    
    // Run screening
    const newQualifyingStocks = await tradingBot.runPreMarketScreener();
    
    // Check for new opportunities not already in current positions
    const currentSymbols = botStatus.positions.map(p => p.symbol);
    const currentQualifyingSymbols = botStatus.qualifyingStocks.map(s => s.symbol);
    
    const newOpportunities = newQualifyingStocks.filter(stock => 
      !currentSymbols.includes(stock.symbol) && 
      !currentQualifyingSymbols.includes(stock.symbol)
    );
    
    if (newOpportunities.length > 0) {
      logger.info(`🎯 Found ${newOpportunities.length} new pre-market opportunities`);
      
      // Add to qualifying stocks list
      botStatus.qualifyingStocks = [...botStatus.qualifyingStocks, ...newOpportunities];
      
      // Execute trades on new opportunities
      await tradingBot.executePreMarketTrades(newOpportunities);
      
      // Send notification
      io.emit('message', { 
        type: 'info', 
        text: `🔍 Real-time scan found ${newOpportunities.length} new opportunities` 
      });
      
      // Emit scan results
      io.emit('scanResults', {
        timestamp: moment().tz('America/New_York').format('h:mm:ss A'),
        session: 'premarket',
        newOpportunities: newOpportunities.length,
        totalQualifying: botStatus.qualifyingStocks.length
      });
      
      // Broadcast updated status
      broadcastStatus();
    } else {
      // Emit scan results even if no new opportunities
      io.emit('scanResults', {
        timestamp: moment().tz('America/New_York').format('h:mm:ss A'),
        session: 'premarket',
        newOpportunities: 0,
        totalQualifying: botStatus.qualifyingStocks.length
      });
    }
    
    // Update account status
    await updateBotStatus();
    
  } catch (error) {
    logger.error('Real-time pre-market scan error:', error);
  }
}

async function runRealTimeMarketScan() {
  try {
    logger.info('🔍 Running real-time market hours scan...');
    
    // Run screening
    const newQualifyingStocks = await tradingBot.runMarketHoursScreener();
    
    // Check for new opportunities
    const currentSymbols = botStatus.positions.map(p => p.symbol);
    const currentQualifyingSymbols = botStatus.qualifyingStocks.map(s => s.symbol);
    
    const newOpportunities = newQualifyingStocks.filter(stock => 
      !currentSymbols.includes(stock.symbol) && 
      !currentQualifyingSymbols.includes(stock.symbol)
    );
    
    if (newOpportunities.length > 0) {
      logger.info(`🎯 Found ${newOpportunities.length} new market hours opportunities`);
      
      // Add to qualifying stocks list
      botStatus.qualifyingStocks = [...botStatus.qualifyingStocks, ...newOpportunities];
      
      // Execute trades on new opportunities
      await tradingBot.executeMarketHoursTrades(newOpportunities);
      
      // Send notification
      io.emit('message', { 
        type: 'info', 
        text: `🔍 Real-time scan found ${newOpportunities.length} new opportunities` 
      });
      
      // Emit scan results
      io.emit('scanResults', {
        timestamp: moment().tz('America/New_York').format('h:mm:ss A'),
        session: 'market',
        newOpportunities: newOpportunities.length,
        totalQualifying: botStatus.qualifyingStocks.length
      });
      
      // Broadcast updated status
      broadcastStatus();
    } else {
      // Emit scan results even if no new opportunities
      io.emit('scanResults', {
        timestamp: moment().tz('America/New_York').format('h:mm:ss A'),
        session: 'market',
        newOpportunities: 0,
        totalQualifying: botStatus.qualifyingStocks.length
      });
    }
    
    // Also monitor existing positions for MACD exits
    await monitorExistingPositions();
    
    // Update account status
    await updateBotStatus();
    
  } catch (error) {
    logger.error('Real-time market scan error:', error);
  }
}

async function monitorExistingPositions() {
  try {
    if (botStatus.positions.length === 0) {
      return;
    }
    
    logger.info('📊 Monitoring existing positions for MACD exits...');
    
    // Monitor positions for exit signals
    const monitorResults = await tradingBot.monitorOpenPositions();
    
    if (monitorResults && monitorResults.exits_triggered > 0) {
      logger.info(`⚠️ MACD exit triggered for ${monitorResults.exits_triggered} positions`);
      
      io.emit('message', { 
        type: 'warning', 
        text: `📉 MACD exit triggered for ${monitorResults.exits_triggered} positions` 
      });
    }
    
  } catch (error) {
    logger.error('Position monitoring error:', error);
  }
}

// Initialize the application
async function initialize() {
  try {
    // Test trading bot connection
    await tradingBot.initialize();
    
    // Setup scheduled jobs
    setupScheduledJobs();
    
    // Start continuous monitoring
    startContinuousMonitoring();
    
    // Initial status update
    await updateBotStatus();
    
    logger.info('🚀 Trading Bot Server initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize trading bot:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  
  // Stop all scheduled jobs
  Object.values(botStatus.scheduledJobs).forEach(job => {
    if (job) job.stop();
  });
  
  // Stop monitoring
  stopContinuousMonitoring();
  stopStatusBroadcasting();
  
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Trading Bot Server running on port ${PORT}`);
  initialize();
});

// Trade log API endpoints
app.get('/api/trades', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const csvPath = path.join(__dirname, '..', 'trade_log.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.json({ trades: [], message: 'No trade log found' });
    }

    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    if (lines.length <= 1) {
      return res.json({ trades: [], message: 'No trades found' });
    }

    const headers = lines[0].split(',');
    const trades = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length) {
        const trade = {
          id: `trade_${i}`,
          timestamp: values[0],
          symbol: values[1],
          action: values[2],
          shares: parseFloat(values[3]) || 0,
          price: parseFloat(values[4]) || 0,
          value: parseFloat(values[5]) || 0,
          stopLoss: parseFloat(values[6]) || null,
          takeProfit: parseFloat(values[7]) || null,
          changePct: parseFloat(values[8]) || 0,
          volume: parseFloat(values[9]) || 0,
          session: values[2] === 'BUY' ? 'premarket' : 'market', // Determine session
          strategy: 'Ross Cameron Pattern'
        };

        // Calculate P&L for SELL orders
        if (trade.action === 'SELL' && i > 1) {
          // Find corresponding BUY order
          const buyTrade = trades.find(t => 
            t.symbol === trade.symbol && 
            t.action === 'BUY' && 
            new Date(t.timestamp) < new Date(trade.timestamp)
          );
          
          if (buyTrade) {
            trade.pnl = (trade.price - buyTrade.price) * trade.shares;
          }
        }

        trades.push(trade);
      }
    }

    res.json({ 
      trades, 
      totalTrades: trades.length,
      lastUpdate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error reading trade log:', error);
    res.status(500).json({ error: 'Failed to read trade log' });
  }
});

app.get('/api/trades/daily-stats', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Get trades for specific date or all trades
    const tradesResponse = await fetch('http://localhost:3001/api/trades');
    const { trades } = await tradesResponse.json();
    
    if (date) {
      const dayTrades = trades.filter(trade => 
        trade.timestamp.startsWith(date)
      );
      
      const stats = calculateDayStats(dayTrades);
      res.json(stats);
    } else {
      // Return stats for last 30 days
      const last30Days = {};
      trades.forEach(trade => {
        const day = trade.timestamp.split('T')[0];
        if (!last30Days[day]) {
          last30Days[day] = [];
        }
        last30Days[day].push(trade);
      });
      
      const dailyStats = Object.entries(last30Days).map(([date, dayTrades]) => ({
        date,
        ...calculateDayStats(dayTrades)
      }));
      
      res.json(dailyStats);
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate daily stats' });
  }
});

function calculateDayStats(trades) {
  const sells = trades.filter(t => t.action === 'SELL');
  const wins = sells.filter(t => (t.pnl || 0) > 0);
  const losses = sells.filter(t => (t.pnl || 0) < 0);
  
  return {
    totalTrades: sells.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: sells.length > 0 ? (wins.length / sells.length) * 100 : 0,
    totalPnL: sells.reduce((sum, t) => sum + (t.pnl || 0), 0),
    avgWin: wins.length > 0 ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length : 0,
    avgLoss: losses.length > 0 ? losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / losses.length : 0,
    volume: trades.reduce((sum, t) => sum + (t.value || 0), 0)
  };
}

// Export trade data to Excel
app.get('/api/trades/export', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const csvPath = path.join(__dirname, '..', 'trade_log.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'No trade log found' });
    }

    const csvData = fs.readFileSync(csvPath, 'utf-8');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="trade_log_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to export trade log' });
  }
});

// SMS Configuration API
app.get('/api/sms/status', (req, res) => {
  res.json({
    enabled: smsService.enabled,
    configured: !!(smsService.smsEmail && process.env.EMAIL_USER)
  });
});

app.post('/api/sms/test', async (req, res) => {
  try {
    await smsService.sendSMS('🧪 Test message from AlpacaBot! Email-to-SMS notifications are working correctly.');
    res.json({ success: true, message: 'Test email-SMS sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sms/toggle', (req, res) => {
  const { enabled } = req.body;
  smsService.enabled = enabled;
  
  const message = enabled ? 'Email-SMS notifications enabled' : 'Email-SMS notifications disabled';
  res.json({ success: true, message, enabled: smsService.enabled });
});

// Test endpoint for real-time broadcasting (development only)
app.post('/api/test/start-broadcasting', (req, res) => {
  botStatus.isRunning = true;
  botStatus.currentSession = 'test';
  startStatusBroadcasting();
  res.json({ message: 'Real-time broadcasting started for testing' });
});

app.post('/api/test/stop-broadcasting', (req, res) => {
  stopStatusBroadcasting();
  botStatus.isRunning = false;
  res.json({ message: 'Real-time broadcasting stopped' });
});

//# sourceMappingURL=index.js.map
