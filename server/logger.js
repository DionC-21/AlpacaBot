const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFileName() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `trading-bot-${date}.log`);
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const fullMessage = args.length > 0 ? `${message} ${args.join(' ')}` : message;
    return `[${timestamp}] [${level.toUpperCase()}] ${fullMessage}`;
  }

  writeToFile(formattedMessage) {
    const logFile = this.getLogFileName();
    fs.appendFileSync(logFile, formattedMessage + '\n');
  }

  info(message, ...args) {
    const formatted = this.formatMessage('info', message, ...args);
    console.log(`ℹ️  ${formatted}`);
    this.writeToFile(formatted);
  }

  error(message, ...args) {
    const formatted = this.formatMessage('error', message, ...args);
    console.error(`❌ ${formatted}`);
    this.writeToFile(formatted);
  }

  warn(message, ...args) {
    const formatted = this.formatMessage('warn', message, ...args);
    console.warn(`⚠️  ${formatted}`);
    this.writeToFile(formatted);
  }

  debug(message, ...args) {
    const formatted = this.formatMessage('debug', message, ...args);
    console.log(`🐛 ${formatted}`);
    this.writeToFile(formatted);
  }

  success(message, ...args) {
    const formatted = this.formatMessage('success', message, ...args);
    console.log(`✅ ${formatted}`);
    this.writeToFile(formatted);
  }
}

module.exports = Logger;
