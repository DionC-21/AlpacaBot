# AlpacaBot Background Service Guide

This guide explains how to run AlpacaBot as a background service that operates continuously without requiring a visible window.

## 🎯 Overview

AlpacaBot can operate in several modes:

1. **Normal Desktop Mode** - Full GUI with visible window
2. **Background Mode** - Hidden window, accessible via system tray
3. **Service Mode** - Automatic startup as system service

## 🚀 Quick Start - Background Mode

### Option 1: Run Once in Background
```bash
# Development mode (background)
npm run desktop-dev-background

# Production mode (background)
npm run desktop-background

# Or use service manager
./scripts/service-manager.sh background
```

### Option 2: Install as System Service (Auto-start)
```bash
# Install the service (will auto-start on boot)
./scripts/service-manager.sh install

# Check service status
./scripts/service-manager.sh status

# View logs
./scripts/service-manager.sh logs
```

## 🎛️ Service Management

### Using the Service Manager Script
```bash
# Start service
./scripts/service-manager.sh start

# Stop service
./scripts/service-manager.sh stop

# Restart service
./scripts/service-manager.sh restart

# Check status
./scripts/service-manager.sh status

# View recent logs
./scripts/service-manager.sh logs

# Uninstall service
./scripts/service-manager.sh uninstall
```

### Manual LaunchAgent Commands (macOS)
```bash
# Load service
launchctl load ~/Library/LaunchAgents/com.alpacabot.trading.plist

# Start service
launchctl start com.alpacabot.trading

# Stop service
launchctl stop com.alpacabot.trading

# Unload service
launchctl unload ~/Library/LaunchAgents/com.alpacabot.trading.plist
```

## 🔧 System Tray Controls

When running in background mode, AlpacaBot appears as a system tray icon with these options:

- **Show Dashboard** - Open the main trading interface
- **Hide Dashboard** - Hide the window (keep running in background)
- **Trading Bot Control** - Start/Stop/Restart trading operations
- **System Status** - Quick access to positions and performance
- **Logs & Config** - Open logs and configuration folders
- **Quit** - Stop all trading and exit completely

## 📁 File Locations

### Service Configuration
- **Service File**: `~/Library/LaunchAgents/com.alpacabot.trading.plist`
- **Install Script**: `./scripts/install-service-macos.sh`
- **Uninstall Script**: `./scripts/uninstall-service-macos.sh`

### Logs
- **Service Logs**: `~/Library/Logs/AlpacaBot/service.log`
- **Error Logs**: `~/Library/Logs/AlpacaBot/service-error.log`
- **Trading Logs**: `./logs/` (in project directory)

## 🔄 Command Line Options

When running Electron directly:
```bash
# Start hidden (background mode)
electron . --hidden

# Start as background service
electron . --background

# Disable sandbox (for service mode)
electron . --background --no-sandbox
```

## 🛠️ Troubleshooting

### Service Won't Start
1. Check if Electron is installed globally:
   ```bash
   npm install -g electron
   ```

2. Verify the service file exists:
   ```bash
   ls ~/Library/LaunchAgents/com.alpacabot.trading.plist
   ```

3. Check service logs:
   ```bash
   ./scripts/service-manager.sh logs
   ```

### Can't Find System Tray Icon
- On macOS, look in the top menu bar (may be hidden under the "Show hidden icons" arrow)
- The icon might appear as a small trading chart or "A" symbol

### Service Keeps Stopping
- Check the error logs: `~/Library/Logs/AlpacaBot/service-error.log`
- Ensure all dependencies are installed: `npm install`
- Verify Python environment is properly configured

## 🔐 Security Considerations

- The service runs with your user permissions
- Trading API keys are stored in your configuration files
- Logs may contain sensitive information - secure the logs directory
- Consider firewall rules if opening network ports

## 📊 Performance Monitoring

Monitor your background service:
- System tray shows real-time status
- Logs are automatically rotated
- Check CPU/memory usage in Activity Monitor
- Trading metrics available through the dashboard

## 🆘 Emergency Stop

To immediately stop all trading:
1. Right-click system tray icon → "Quit AlpacaBot"
2. Or use terminal: `./scripts/service-manager.sh stop`
3. Or force quit: `launchctl stop com.alpacabot.trading`

## 🎯 Next Steps

Once your background service is running:
1. Monitor via system tray
2. Check logs regularly
3. Access dashboard when needed
4. Configure automatic trading schedules
5. Set up monitoring alerts
