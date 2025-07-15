#!/bin/bash

# AlpacaBot macOS Service Uninstaller

SERVICE_NAME="com.alpacabot.trading"
PLIST_NAME="${SERVICE_NAME}.plist"
USER_AGENTS_DIR="$HOME/Library/LaunchAgents"

echo "🤖 AlpacaBot Service Uninstaller for macOS"
echo "=========================================="

# Stop the service if running
echo "🛑 Stopping AlpacaBot service..."
launchctl stop "$SERVICE_NAME" 2>/dev/null

# Unload the service
echo "📤 Unloading service configuration..."
launchctl unload "$USER_AGENTS_DIR/$PLIST_NAME" 2>/dev/null

# Remove the plist file
if [ -f "$USER_AGENTS_DIR/$PLIST_NAME" ]; then
    rm "$USER_AGENTS_DIR/$PLIST_NAME"
    echo "✅ Service configuration removed"
else
    echo "ℹ️  Service configuration not found"
fi

echo ""
echo "✅ AlpacaBot service has been uninstalled"
echo "💡 Logs are preserved at: $HOME/Library/Logs/AlpacaBot/"
echo "💡 To remove logs: rm -rf $HOME/Library/Logs/AlpacaBot/"
