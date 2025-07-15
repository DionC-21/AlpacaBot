#!/bin/bash

# AlpacaBot Quick Start - Background Mode
# Double-click this file to start AlpacaBot in background mode

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

echo "🤖 Starting AlpacaBot in Background Mode..."
echo "==========================================="
echo ""
echo "📍 Project Directory: $PROJECT_DIR"
echo "⏰ Starting at: $(date)"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build and run in background
echo "🚀 Launching AlpacaBot..."
echo ""
echo "✅ AlpacaBot will run in the background"
echo "🔍 Look for the AlpacaBot icon in your menu bar/system tray"
echo "🖱️  Right-click the icon to access controls"
echo ""
echo "⚠️  Keep this terminal window open or AlpacaBot will stop"
echo "💡 To close AlpacaBot, use Ctrl+C here or quit from the tray menu"
echo ""

# Run in background mode
npm run desktop-background
