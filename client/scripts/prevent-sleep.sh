#!/bin/bash

# AlpacaBot Sleep Prevention Script
# Prevents macOS from sleeping while trading

echo "🌙 AlpacaBot Sleep Prevention Setup"
echo "=================================="
echo ""
echo "This will configure your Mac to stay awake for trading:"
echo "✅ Prevent sleep while plugged in"
echo "✅ Keep display on during market hours"
echo "✅ Optional: Schedule wake/sleep times"
echo ""

# Check current power settings
echo "📊 Current Power Settings:"
pmset -g

echo ""
echo "🔧 Configuring power settings for trading..."

# Prevent sleep while plugged in (AC power)
sudo pmset -c sleep 0
sudo pmset -c displaysleep 30  # Display can sleep after 30 min
sudo pmset -c disksleep 0      # Disks never sleep

# Prevent sleep on battery (optional - reduces battery life)
read -p "⚠️  Also prevent sleep on battery? (reduces battery life) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo pmset -b sleep 0
    sudo pmset -b displaysleep 10
    echo "✅ Sleep prevention enabled on battery"
else
    echo "ℹ️  Battery sleep settings unchanged"
fi

# Create scheduled wake/sleep for trading hours (optional)
read -p "📅 Set up scheduled wake/sleep for trading hours? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting up wake at 6:00 AM on weekdays..."
    # Wake at 6:00 AM Monday-Friday for pre-market
    sudo pmset repeat wake MTWRF 06:00:00
    
    echo "Setting up sleep at 8:00 PM on weekdays..."
    # Sleep at 8:00 PM Monday-Friday after market close
    sudo pmset repeat sleep MTWRF 20:00:00
    
    echo "✅ Scheduled wake/sleep configured"
else
    echo "ℹ️  No scheduled wake/sleep configured"
fi

echo ""
echo "✅ Power management configured for trading!"
echo ""
echo "📋 What this means:"
echo "   • Mac won't sleep while plugged in"
echo "   • Display dims but stays responsive"
echo "   • AlpacaBot runs continuously"
echo "   • Network stays connected"
echo ""
echo "🔄 To restore original settings:"
echo "   sudo pmset restoredefaults"
echo ""
echo "⚡ Power consumption will increase - keep MacBook plugged in!"
