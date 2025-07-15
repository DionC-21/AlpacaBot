# SMS Notifications Setup Guide

This guide will help you set up SMS notifications for your AlpacaBot trading system using Twilio.

## Prerequisites

- Active Twilio account
- Verified phone number with Twilio
- AlpacaBot project running

## Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number
4. Complete the account setup

## Step 2: Get Twilio Credentials

1. **Account SID**: Found on your Twilio Console Dashboard
2. **Auth Token**: Found on your Twilio Console Dashboard (click the eye icon to reveal)
3. **Phone Number**: Purchase a phone number from Twilio Console

### Getting a Phone Number
1. In Twilio Console, go to "Phone Numbers" → "Manage" → "Buy a number"
2. Choose a number with SMS capabilities
3. Purchase the number (free trial includes $15 credit)

## Step 3: Configure Environment Variables

Edit your `.env` file in the AlpacaBot root directory:

```bash
# SMS Notifications via Twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
NOTIFICATION_PHONE_NUMBER=+1987654321
SMS_NOTIFICATIONS_ENABLED=true
```

### Important Notes:
- Replace `your_account_sid_here` with your actual Account SID
- Replace `your_auth_token_here` with your actual Auth Token
- Use the full phone number format with country code (e.g., +1234567890)
- `TWILIO_PHONE_NUMBER` is the number you purchased from Twilio
- `NOTIFICATION_PHONE_NUMBER` is YOUR personal phone number where you want to receive alerts

## Step 4: Restart the Server

```bash
cd /Users/dionc/Desktop/AlpacaBot
npm run server
```

## Step 5: Test SMS Notifications

1. Open the AlpacaBot dashboard in your browser
2. Go to the Bot Controls section
3. Find the "SMS Notifications" section
4. Toggle SMS notifications ON
5. Click "Send Test SMS" button
6. Check your phone for the test message

## What SMS Notifications You'll Receive

✅ **Bot Lifecycle Events:**
- 🌅 Pre-market session start (4:00 AM ET)
- 🌞 Market hours session start (9:30 AM ET)
- 🔚 Market close and daily summary (4:00 PM ET)
- 🛑 Manual bot stop

✅ **Trade Execution:**
- 🟢 Buy orders executed (symbol, shares, price, value)
- 🔴 Sell orders executed (symbol, shares, price, value, P&L)
- 💰 Win/loss status for each trade

✅ **Position Management:**
- 🚪 Individual positions closed
- 🔴 All positions closed (bulk action)

✅ **Daily Summary:**
- 📊 Total trades, win rate, P&L, volume
- 🎯 Performance metrics

✅ **Error Alerts:**
- ⚠️ System errors and exceptions
- 🚨 Account alerts

## SMS Message Examples

### Bot Start Notification:
```
🌅 AlpacaBot STARTED
📅 PREMARKET Session
⏰ 4:00:12 AM ET

Ready to trade! 🚀
```

### Buy Order Notification:
```
🟢 BUY ORDER EXECUTED
📈 AAPL
📊 50 shares @ $150.25
💰 Total: $7,512.50
🎯 Strategy: Pre-market Pattern
⏰ 4:05:30 AM ET
```

### Daily Summary Notification:
```
📊 DAILY TRADING SUMMARY
📅 Mon, Jul 14

💰 Total P&L: $487.35
📈 Total Trades: 8
✅ Winning: 6
❌ Losing: 2
🎯 Win Rate: 75.0%
💵 Volume: $24,350
🚀 Keep it up!
```

## Troubleshooting

### SMS Not Working?
1. Check that all environment variables are set correctly
2. Verify phone numbers include country code (+1 for US)
3. Ensure your Twilio account has sufficient balance
4. Check Twilio Console logs for delivery status

### Phone Number Issues?
- Make sure both phone numbers are verified with Twilio
- Use E.164 format (+1234567890)
- For trial accounts, you can only send to verified numbers

### Rate Limits?
- Twilio has rate limits on free accounts
- Consider upgrading if you need higher volumes
- SMS are sent for significant events only to minimize volume

## Cost Information

- **Free Trial**: $15 credit included
- **SMS Cost**: ~$0.0075 per message in the US
- **Phone Number**: ~$1/month for basic number
- **Daily Usage**: Typically 10-20 SMS per trading day

## Support

For Twilio-specific issues:
- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Support](https://support.twilio.com)

For AlpacaBot SMS issues:
- Check the browser console for errors
- Review server logs in the terminal
- Ensure the bot is configured correctly

---

**Security Note**: Never commit your `.env` file with real credentials to version control. Keep your Twilio credentials secure and rotate them periodically.
