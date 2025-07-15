#!/bin/bash

# AlpacaBot System Service One-Click Installer
# This will install AlpacaBot to run automatically on startup

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🤖 AlpacaBot System Service Installer"
echo "====================================="
echo ""
echo "This will install AlpacaBot as a system service that:"
echo "✅ Starts automatically when you log in"
echo "✅ Runs continuously in the background"
echo "✅ Appears in your system tray/menu bar"
echo "✅ Survives system restarts"
echo ""
echo "⚠️  This requires your permission to modify system files"
echo ""

read -p "Do you want to proceed with the installation? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Installing AlpacaBot service..."
    
    # Run the installer script
    bash "$SCRIPT_DIR/scripts/install-service-macos.sh"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Installation completed successfully!"
        echo ""
        echo "📋 What happens now:"
        echo "   • AlpacaBot is running in the background"
        echo "   • Look for the icon in your menu bar"
        echo "   • It will auto-start on future logins"
        echo "   • Right-click the tray icon for controls"
        echo ""
        echo "🛠️  Management commands:"
        echo "   • Start:    ./scripts/service-manager.sh start"
        echo "   • Stop:     ./scripts/service-manager.sh stop"
        echo "   • Status:   ./scripts/service-manager.sh status"
        echo "   • Logs:     ./scripts/service-manager.sh logs"
        echo "   • Remove:   ./scripts/service-manager.sh uninstall"
        echo ""
    else
        echo ""
        echo "❌ Installation failed. Please check the error messages above."
        echo ""
    fi
else
    echo ""
    echo "🚫 Installation cancelled by user"
    echo ""
    echo "💡 Alternative options:"
    echo "   • Run once in background: ./start-background.sh"
    echo "   • Manual service install: ./scripts/install-service-macos.sh"
    echo ""
fi
