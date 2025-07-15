#!/bin/bash

# AlpacaBot Auto-Restart Monitor
# This script monitors the AlpacaBot process and restarts it if it stops

SERVICE_NAME="com.alpacabot.trading"
CHECK_INTERVAL=30  # Check every 30 seconds
LOG_FILE="$HOME/Library/Logs/AlpacaBot/monitor.log"

echo "🤖 AlpacaBot Monitor Started - $(date)" >> "$LOG_FILE"

while true; do
    # Check if the service is running
    if ! launchctl list | grep -q "$SERVICE_NAME"; then
        echo "⚠️  AlpacaBot service not found - attempting restart - $(date)" >> "$LOG_FILE"
        launchctl start "$SERVICE_NAME" 2>&1 >> "$LOG_FILE"
    else
        # Service is loaded, check if it's actually running
        SERVICE_PID=$(launchctl list "$SERVICE_NAME" | grep "PID" | awk '{print $3}')
        if [ "$SERVICE_PID" = "-" ]; then
            echo "🔄 AlpacaBot service stopped - restarting - $(date)" >> "$LOG_FILE"
            launchctl start "$SERVICE_NAME" 2>&1 >> "$LOG_FILE"
        fi
    fi
    
    sleep $CHECK_INTERVAL
done
