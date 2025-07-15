const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

class EmailSMSNotificationService {
  constructor() {
    // Create email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can use gmail, outlook, yahoo, etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use app-specific password for Gmail
      }
    });
    
    // Configuration
    this.smsEmail = process.env.SMS_EMAIL_ADDRESS; // e.g., 8139812277@vtext.com
    this.enabled = process.env.EMAIL_SMS_ENABLED === 'true';
    
    if (!this.smsEmail || !process.env.EMAIL_USER) {
      console.warn('Email-SMS notifications not configured. Missing email credentials.');
      this.enabled = false;
    }
  }

  async sendSMS(message) {
    if (!this.enabled) {
      console.log('Email-SMS notifications disabled. Message:', message);
      return;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: this.smsEmail,
        subject: '', // Keep subject empty for SMS
        text: message
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email-SMS sent successfully: ${result.messageId}`);
      return result;
    } catch (error) {
      console.error('Failed to send Email-SMS:', error.message);
      throw error;
    }
  }

  // Bot lifecycle notifications
  async notifyBotStarted(session = 'market') {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    const sessionEmoji = session === 'premarket' ? '🌅' : '🌞';
    const message = `${sessionEmoji} AlpacaBot STARTED\n📅 ${session.toUpperCase()} Session\n⏰ ${time} ET\n\nReady to trade! 🚀`;
    
    await this.sendSMS(message);
  }

  async notifyBotStopped(dailyStats = null) {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    let message = `🛑 AlpacaBot STOPPED\n⏰ ${time} ET\n\n`;
    
    if (dailyStats) {
      const pnlEmoji = dailyStats.totalPnL >= 0 ? '💰' : '📉';
      const winRateEmoji = dailyStats.winRate >= 60 ? '🎯' : dailyStats.winRate >= 40 ? '⚖️' : '📊';
      
      message += `📊 Daily Summary:\n`;
      message += `${pnlEmoji} P&L: $${dailyStats.totalPnL.toFixed(2)}\n`;
      message += `📈 Trades: ${dailyStats.totalTrades}\n`;
      message += `${winRateEmoji} Win Rate: ${dailyStats.winRate.toFixed(1)}%\n`;
      message += `💵 Volume: $${dailyStats.volume.toFixed(0)}`;
    } else {
      message += `Trading session complete.`;
    }
    
    await this.sendSMS(message);
  }

  // Trade notifications
  async notifyTradeBuy(symbol, shares, price, value, strategy = 'Pattern') {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    const message = `🟢 BUY ORDER EXECUTED\n` +
                   `📈 ${symbol}\n` +
                   `📊 ${shares} shares @ $${price.toFixed(2)}\n` +
                   `💰 Total: $${value.toFixed(2)}\n` +
                   `🎯 Strategy: ${strategy}\n` +
                   `⏰ ${time} ET`;
    
    await this.sendSMS(message);
  }

  async notifyTradeSell(symbol, shares, price, value, pnl, strategy = 'Pattern') {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    const pnlEmoji = pnl >= 0 ? '💰' : '📉';
    const resultEmoji = pnl >= 0 ? '✅' : '❌';
    const result = pnl >= 0 ? 'WIN' : 'LOSS';
    
    const message = `🔴 SELL ORDER EXECUTED\n` +
                   `📉 ${symbol}\n` +
                   `📊 ${shares} shares @ $${price.toFixed(2)}\n` +
                   `💰 Total: $${value.toFixed(2)}\n` +
                   `${pnlEmoji} P&L: $${pnl.toFixed(2)}\n` +
                   `${resultEmoji} ${result}\n` +
                   `🎯 Strategy: ${strategy}\n` +
                   `⏰ ${time} ET`;
    
    await this.sendSMS(message);
  }

  // Position management notifications
  async notifyPositionClosed(symbol, pnl, reason = 'Manual') {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    const pnlEmoji = pnl >= 0 ? '💰' : '📉';
    const resultEmoji = pnl >= 0 ? '✅' : '❌';
    const result = pnl >= 0 ? 'WIN' : 'LOSS';
    
    const message = `🚪 POSITION CLOSED\n` +
                   `📊 ${symbol}\n` +
                   `${pnlEmoji} P&L: $${pnl.toFixed(2)}\n` +
                   `${resultEmoji} ${result}\n` +
                   `📋 Reason: ${reason}\n` +
                   `⏰ ${time} ET`;
    
    await this.sendSMS(message);
  }

  async notifyAllPositionsClosed(totalPnL, positionCount) {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    const pnlEmoji = totalPnL >= 0 ? '💰' : '📉';
    
    const message = `🔴 ALL POSITIONS CLOSED\n` +
                   `📊 ${positionCount} positions\n` +
                   `${pnlEmoji} Total P&L: $${totalPnL.toFixed(2)}\n` +
                   `⏰ ${time} ET`;
    
    await this.sendSMS(message);
  }

  // Error and alert notifications
  async notifyError(error, context = 'Trading Bot') {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    const message = `⚠️ ERROR ALERT\n` +
                   `🤖 ${context}\n` +
                   `❌ ${error}\n` +
                   `⏰ ${time} ET\n\n` +
                   `Please check the dashboard!`;
    
    await this.sendSMS(message);
  }

  async notifyAccountAlert(message, accountValue = null) {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    let alertMessage = `🚨 ACCOUNT ALERT\n${message}\n`;
    
    if (accountValue) {
      alertMessage += `💼 Account Value: $${accountValue.toFixed(2)}\n`;
    }
    
    alertMessage += `⏰ ${time} ET`;
    
    await this.sendSMS(alertMessage);
  }

  // Daily summary notification
  async notifyDailySummary(stats) {
    const date = new Date().toLocaleDateString('en-US', { 
      timeZone: 'America/New_York',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    const pnlEmoji = stats.totalPnL >= 0 ? '💰' : '📉';
    const winRateEmoji = stats.winRate >= 60 ? '🎯' : stats.winRate >= 40 ? '⚖️' : '📊';
    const performanceEmoji = stats.totalPnL >= 0 ? '🚀' : '📈';
    
    const message = `📊 DAILY TRADING SUMMARY\n` +
                   `📅 ${date}\n\n` +
                   `${pnlEmoji} Total P&L: $${stats.totalPnL.toFixed(2)}\n` +
                   `📈 Total Trades: ${stats.totalTrades}\n` +
                   `✅ Winning: ${stats.winningTrades}\n` +
                   `❌ Losing: ${stats.losingTrades}\n` +
                   `${winRateEmoji} Win Rate: ${stats.winRate.toFixed(1)}%\n` +
                   `💵 Volume: $${stats.volume.toFixed(0)}\n` +
                   `${performanceEmoji} Keep it up!`;
    
    await this.sendSMS(message);
  }

  // Market condition notifications
  async notifyMarketCondition(condition, details = '') {
    const time = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York',
      hour12: true 
    });
    
    const conditionEmojis = {
      'bullish': '🐂',
      'bearish': '🐻',
      'volatile': '⚡',
      'sideways': '↔️',
      'halted': '⏸️'
    };
    
    const emoji = conditionEmojis[condition.toLowerCase()] || '📊';
    
    const message = `${emoji} MARKET UPDATE\n` +
                   `📊 Condition: ${condition.toUpperCase()}\n` +
                   (details ? `📝 ${details}\n` : '') +
                   `⏰ ${time} ET`;
    
    await this.sendSMS(message);
  }
}

module.exports = EmailSMSNotificationService;
