#!/bin/bash

# AlpacaBot Service Manager
# Quick commands to manage the AlpacaBot background service

SERVICE_NAME="com.alpacabot.trading"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
    echo "🤖 AlpacaBot Service Manager"
    echo "==========================="
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start the AlpacaBot service"
    echo "  stop        Stop the AlpacaBot service"
    echo "  restart     Restart the AlpacaBot service"
    echo "  status      Check service status"
    echo "  logs        View service logs"
    echo "  install     Install as system service"
    echo "  uninstall   Remove system service"
    echo "  background  Run once in background mode"
    echo "  help        Show this help message"
    echo ""
}

case "$1" in
    start)
        echo "🚀 Starting AlpacaBot service..."
        launchctl start "$SERVICE_NAME"
        ;;
    stop)
        echo "🛑 Stopping AlpacaBot service..."
        launchctl stop "$SERVICE_NAME"
        ;;
    restart)
        echo "🔄 Restarting AlpacaBot service..."
        launchctl stop "$SERVICE_NAME"
        sleep 2
        launchctl start "$SERVICE_NAME"
        ;;
    status)
        echo "📊 AlpacaBot Service Status:"
        if launchctl list | grep -q "$SERVICE_NAME"; then
            echo "✅ Service is loaded"
            launchctl list "$SERVICE_NAME"
        else
            echo "❌ Service is not loaded"
        fi
        ;;
    logs)
        echo "📋 AlpacaBot Service Logs:"
        echo "========================="
        if [ -f "$HOME/Library/Logs/AlpacaBot/service.log" ]; then
            tail -50 "$HOME/Library/Logs/AlpacaBot/service.log"
        else
            echo "No logs found at $HOME/Library/Logs/AlpacaBot/service.log"
        fi
        ;;
    install)
        bash "$SCRIPT_DIR/install-service-macos.sh"
        ;;
    uninstall)
        bash "$SCRIPT_DIR/uninstall-service-macos.sh"
        ;;
    background)
        echo "🌙 Running AlpacaBot in background mode..."
        cd "$(dirname "$SCRIPT_DIR")"
        npm run desktop-background
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
