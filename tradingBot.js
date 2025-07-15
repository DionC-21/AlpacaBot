const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TradingBot {
  constructor(logger, smsService = null) {
    this.logger = logger;
    this.smsService = smsService;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Test Python environment and dependencies
      await this.testPythonEnvironment();
      this.isInitialized = true;
      this.logger.info('✅ Trading bot initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize trading bot:', error);
      throw error;
    }
  }

  async testPythonEnvironment() {
    return new Promise((resolve, reject) => {
      // Use system python3 for Railway deployment
      const pythonPath = 'python3';
      const pythonTest = spawn(pythonPath, ['-c', 'import alpaca_trade_api, yfinance; print("Python environment OK")']);
      
      pythonTest.stdout.on('data', (data) => {
        this.logger.info('Python test:', data.toString());
        resolve();
      });
      
      pythonTest.stderr.on('data', (data) => {
        this.logger.error('Python test error:', data.toString());
        reject(new Error('Python environment test failed'));
      });
    });
  }

  async runPreMarketScreener() {
    this.logger.info('🔍 Running pre-market screener...');
    
    try {
      const results = await this.executePythonScript('run_premarket_screener.py');
      const qualifyingStocks = JSON.parse(results);
      
      this.logger.info(`Found ${qualifyingStocks.length} qualifying stocks for pre-market`);
      return qualifyingStocks;
      
    } catch (error) {
      this.logger.error('Pre-market screener failed:', error);
      throw error;
    }
  }

  async runMarketHoursScreener() {
    this.logger.info('🔍 Running market hours screener...');
    
    try {
      const results = await this.executePythonScript('run_market_hours_screener.py');
      const qualifyingStocks = JSON.parse(results);
      
      this.logger.info(`Found ${qualifyingStocks.length} qualifying stocks for market hours`);
      return qualifyingStocks;
      
    } catch (error) {
      this.logger.error('Market hours screener failed:', error);
      throw error;
    }
  }

  async executePreMarketTrades(qualifyingStocks) {
    this.logger.info(`🚀 Executing pre-market trades for ${qualifyingStocks.length} stocks`);
    
    try {
      const tradeParams = {
        stocks: qualifyingStocks,
        session: 'premarket',
        allocation_strategy: '100_percent_even_split'
      };
      
      const results = await this.executePythonScript('execute_trades.py', JSON.stringify(tradeParams));
      const tradeResults = JSON.parse(results);
      
      this.logger.info(`Pre-market trades executed: ${tradeResults.successful_trades} successful, ${tradeResults.failed_trades} failed`);
      
      // Send SMS notifications for individual trades
      if (this.smsService && tradeResults.trades) {
        for (const trade of tradeResults.trades) {
          if (trade.action === 'BUY' && trade.status === 'filled') {
            await this.smsService.notifyTradeBuy(
              trade.symbol, 
              trade.shares, 
              trade.price, 
              trade.value, 
              'Pre-market Pattern'
            );
          }
        }
      }
      
      return tradeResults;
      
    } catch (error) {
      this.logger.error('Pre-market trade execution failed:', error);
      
      // Send SMS notification for error
      if (this.smsService) {
        await this.smsService.notifyError(error.message, 'Pre-market Trade Execution');
      }
      
      throw error;
    }
  }

  async executeMarketHoursTrades(qualifyingStocks) {
    this.logger.info(`🚀 Executing market hours trades for ${qualifyingStocks.length} stocks`);
    
    try {
      const tradeParams = {
        stocks: qualifyingStocks,
        session: 'market',
        allocation_strategy: '100_percent_even_split'
      };
      
      const results = await this.executePythonScript('execute_trades.py', JSON.stringify(tradeParams));
      const tradeResults = JSON.parse(results);
      
      this.logger.info(`Market hours trades executed: ${tradeResults.successful_trades} successful, ${tradeResults.failed_trades} failed`);
      
      // Send SMS notifications for individual trades
      if (this.smsService && tradeResults.trades) {
        for (const trade of tradeResults.trades) {
          if (trade.action === 'BUY' && trade.status === 'filled') {
            await this.smsService.notifyTradeBuy(
              trade.symbol, 
              trade.shares, 
              trade.price, 
              trade.value, 
              'Market Hours Pattern'
            );
          } else if (trade.action === 'SELL' && trade.status === 'filled') {
            await this.smsService.notifyTradeSell(
              trade.symbol, 
              trade.shares, 
              trade.price, 
              trade.value, 
              trade.pnl || 0,
              'Market Hours Pattern'
            );
          }
        }
      }
      
      return tradeResults;
      
    } catch (error) {
      this.logger.error('Market hours trade execution failed:', error);
      
      // Send SMS notification for error
      if (this.smsService) {
        await this.smsService.notifyError(error.message, 'Market Hours Trade Execution');
      }
      
      throw error;
    }
  }

  async monitorOpenPositions() {
    try {
      const results = await this.executePythonScript('monitor_positions.py');
      const monitoringResults = JSON.parse(results);
      
      if (monitoringResults.positions_closed > 0) {
        this.logger.info(`📊 MACD monitoring closed ${monitoringResults.positions_closed} positions`);
      }
      
      return monitoringResults;
      
    } catch (error) {
      this.logger.error('Position monitoring failed:', error);
      throw error;
    }
  }

  async getAccount() {
    try {
      const results = await this.executePythonScript('get_account_info.py');
      return JSON.parse(results);
    } catch (error) {
      this.logger.error('Failed to get account info:', error);
      throw error;
    }
  }

  async getPositions() {
    try {
      const results = await this.executePythonScript('get_positions.py');
      return JSON.parse(results);
    } catch (error) {
      this.logger.error('Failed to get positions:', error);
      throw error;
    }
  }

  async getOrders() {
    try {
      const results = await this.executePythonScript('get_orders.py');
      return JSON.parse(results);
    } catch (error) {
      this.logger.error('Failed to get orders:', error);
      throw error;
    }
  }

  async closeAllPositions() {
    try {
      const results = await this.executePythonScript('close_all_positions.py');
      const closeResults = JSON.parse(results);
      
      this.logger.info(`🔴 Closed ${closeResults.positions_closed} positions`);
      
      // Send SMS notification for all positions closed
      if (this.smsService && closeResults.positions_closed > 0) {
        const totalPnL = closeResults.total_pnl || 0;
        await this.smsService.notifyAllPositionsClosed(totalPnL, closeResults.positions_closed);
      }
      
      return closeResults;
      
    } catch (error) {
      this.logger.error('Failed to close all positions:', error);
      
      // Send SMS notification for error
      if (this.smsService) {
        await this.smsService.notifyError(error.message, 'Close All Positions');
      }
      
      throw error;
    }
  }

  async generateDailyReport() {
    try {
      const results = await this.executePythonScript('generate_daily_report.py');
      return JSON.parse(results);
    } catch (error) {
      this.logger.error('Failed to generate daily report:', error);
      throw error;
    }
  }

  async executePythonScript(scriptName, inputData = null) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'python_scripts', scriptName);
      // Use system python3 for Railway deployment
      const pythonPath = 'python3';
      
      if (!fs.existsSync(scriptPath)) {
        reject(new Error(`Python script not found: ${scriptPath}`));
        return;
      }

      const pythonProcess = spawn(pythonPath, [scriptPath]);
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });
      
      // Send input data if provided
      if (inputData) {
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();
      }
    });
  }
}

module.exports = TradingBot;
