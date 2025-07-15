#!/bin/bash

# AlpacaBot macOS Service Installer
# This script creates a LaunchAgent to run AlpacaBot as a background service

APP_NAME="AlpacaBot"
SERVICE_NAME="com.alpacabot.trading"
PLIST_NAME="${SERVICE_NAME}.plist"
USER_AGENTS_DIR="$HOME/Library/LaunchAgents"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🤖 AlpacaBot Service Installer for macOS"
echo "========================================"

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$USER_AGENTS_DIR"

# Get the absolute path to the project
ELECTRON_PATH="$(which electron)"
if [ -z "$ELECTRON_PATH" ]; then
    echo "❌ Electron not found. Please install Electron globally:"
    echo "   npm install -g electron"
    exit 1
fi

# Create the plist file
cat > "$USER_AGENTS_DIR/$PLIST_NAME" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$SERVICE_NAME</string>
    <key>ProgramArguments</key>
    <array>
        <string>$ELECTRON_PATH</string>
        <string>$PROJECT_DIR</string>
        <string>--background</string>
        <string>--no-sandbox</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>LaunchOnlyOnce</key>
    <false/>
    <key>StandardOutPath</key>
    <string>$HOME/Library/Logs/AlpacaBot/service.log</string>
    <key>StandardErrorPath</key>
    <string>$HOME/Library/Logs/AlpacaBot/service-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
        <key>HOME</key>
        <string>$HOME</string>
    </dict>
</dict>
</plist>
EOF

# Create logs directory
mkdir -p "$HOME/Library/Logs/AlpacaBot"

echo "✅ Service configuration created at: $USER_AGENTS_DIR/$PLIST_NAME"

# Load the service
launchctl load "$USER_AGENTS_DIR/$PLIST_NAME"

if [ $? -eq 0 ]; then
    echo "✅ AlpacaBot service installed and started successfully!"
    echo ""
    echo "📋 Service Management Commands:"
    echo "   Start service:  launchctl start $SERVICE_NAME"
    echo "   Stop service:   launchctl stop $SERVICE_NAME"
    echo "   Restart:        launchctl stop $SERVICE_NAME && launchctl start $SERVICE_NAME"
    echo "   Uninstall:      bash scripts/uninstall-service-macos.sh"
    echo ""
    echo "📁 Logs location: $HOME/Library/Logs/AlpacaBot/"
    echo ""
    echo "🎯 AlpacaBot is now running in the background!"
    echo "   Look for the AlpacaBot icon in your system tray (menu bar)"
else
    echo "❌ Failed to start the service. Check the logs for details."
    exit 1
fi
