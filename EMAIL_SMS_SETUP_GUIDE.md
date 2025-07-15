# Email-to-SMS Setup Guide (Free Alternative to Twilio)

This guide will help you set up FREE SMS notifications using email-to-SMS gateways provided by phone carriers.

## How It Works

📧 **Your bot sends emails** → 📱 **Carrier converts to SMS** → 🔔 **You receive text alerts**

**Benefits:**
- ✅ **100% FREE** - No Twilio fees
- ✅ **No registration** required
- ✅ **Works with any email provider**
- ✅ **Same great notifications**

## Step 1: Find Your Carrier's SMS Gateway

**Major US Carriers:**
- **Verizon**: `yournumber@vtext.com`
- **AT&T**: `yournumber@txt.att.net`
- **T-Mobile**: `yournumber@tmomail.net`
- **Sprint**: `yournumber@messaging.sprintpcs.com`
- **Cricket**: `yournumber@sms.cricketwireless.net`
- **Metro PCS**: `yournumber@mymetropcs.com`
- **Boost Mobile**: `yournumber@sms.myboostmobile.com`
- **U.S. Cellular**: `yournumber@email.uscc.net`

**For your number (813-981-2277):**
- If **Verizon**: `8139812277@vtext.com`
- If **AT&T**: `8139812277@txt.att.net`
- If **T-Mobile**: `8139812277@tmomail.net`

## Step 2: Set Up Gmail App Password (Recommended)

### Option A: Gmail (Most Common)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Go to**: https://myaccount.google.com/apppasswords
3. **Generate App Password** for "AlpacaBot"
4. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Option B: Other Email Providers
- **Outlook/Hotmail**: Use regular password (enable "Less secure apps")
- **Yahoo**: Generate app password similar to Gmail
- **Apple iCloud**: Use app-specific password

## Step 3: Configure Your .env File

Replace the email settings in your `.env` file:

```bash
# Email-to-SMS Notifications (Free alternative to Twilio)
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password
SMS_EMAIL_ADDRESS=8139812277@vtext.com
EMAIL_SMS_ENABLED=true
```

### Real Example:
```bash
EMAIL_USER=johnsmith@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
SMS_EMAIL_ADDRESS=8139812277@vtext.com
EMAIL_SMS_ENABLED=true
```

## Step 4: Determine Your Carrier

**Not sure which carrier you have?**
1. **Call your phone**: Dial your number from another phone
2. **Check your bill**: Look at your monthly statement
3. **Ask Siri/Google**: "What carrier am I on?"
4. **Try multiple gateways**: Test different carrier emails

## Step 5: Test the Setup

1. **Update your .env file** with real credentials
2. **Restart the server**:
   ```bash
   cd /Users/dionc/Desktop/AlpacaBot
   npm run server
   ```
3. **Open dashboard**: http://localhost:3000
4. **Go to Bot Controls** → SMS Notifications
5. **Click "Send Test SMS"**
6. **Check your phone** for the message

## Step 6: Test Different Carriers (If Needed)

If messages don't arrive, try different carrier gateways:

```bash
# Try Verizon
SMS_EMAIL_ADDRESS=8139812277@vtext.com

# Try AT&T  
SMS_EMAIL_ADDRESS=8139812277@txt.att.net

# Try T-Mobile
SMS_EMAIL_ADDRESS=8139812277@tmomail.net
```

Restart server after each change and test again.

## What SMS Notifications You'll Receive

✅ **Same great alerts as Twilio:**
- 🌅 Pre-market session start (4:00 AM ET)
- 🌞 Market hours session start (9:30 AM ET)
- 🔚 Market close and daily summary (4:00 PM ET)
- 🟢 Buy orders executed (symbol, shares, price, value)
- 🔴 Sell orders executed (symbol, shares, price, P&L, win/loss)
- 🚪 Position closures
- ⚠️ Error alerts
- 📊 Daily performance summaries

## Example SMS Messages

### Bot Start:
```
🌅 AlpacaBot STARTED
📅 PREMARKET Session
⏰ 4:00:12 AM ET

Ready to trade! 🚀
```

### Buy Order:
```
🟢 BUY ORDER EXECUTED
📈 AAPL
📊 50 shares @ $150.25
💰 Total: $7,512.50
🎯 Strategy: Pre-market Pattern
⏰ 4:05:30 AM ET
```

### Daily Summary:
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

### Messages Not Arriving?

1. **Wrong carrier gateway**
   - Try different carrier emails
   - Call your carrier to confirm

2. **Email authentication failed**
   - Check Gmail app password is correct
   - Ensure 2FA is enabled on Gmail
   - Try using regular password with "less secure apps"

3. **Email blocked**
   - Check spam folder
   - Some carriers block promotional emails
   - Try sending a manual test email

4. **Rate limiting**
   - Carriers may limit email-to-SMS frequency
   - Usually 1-2 messages per minute max

### Manual Test:
Send an email manually to test:
- **To**: `8139812277@vtext.com` (or your carrier's gateway)
- **Subject**: (leave blank)
- **Body**: `Test message`

If this works, the bot will work too!

## Advantages Over Twilio

✅ **$0 Cost** - Completely free  
✅ **No registration** - No account setup needed  
✅ **No verification** - Works with any number  
✅ **No limits** - Send to any phone number  
✅ **Privacy** - No third-party service  

## Limitations

⚠️ **Character limits** - Usually 160 characters per SMS  
⚠️ **Delivery speed** - May be 30-60 seconds slower than Twilio  
⚠️ **Rate limiting** - Carriers may limit frequency  
⚠️ **Reliability** - 95%+ but not 100% guaranteed  

## Support

**Email provider issues:**
- Gmail: https://support.google.com/mail
- Outlook: https://support.microsoft.com/outlook

**Carrier gateway issues:**
- Contact your phone carrier's technical support

**AlpacaBot issues:**
- Check server logs for email sending errors
- Verify credentials in .env file

---

**This setup gives you the same powerful trading notifications as Twilio, but completely FREE! 🎉📱💰**
