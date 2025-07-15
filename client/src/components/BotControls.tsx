import React, { useState, useEffect } from 'react';

interface BotControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onCloseAll: () => void;
}

const BotControls: React.FC<BotControlsProps> = ({ 
  isRunning, 
  onStart, 
  onStop, 
  onCloseAll 
}) => {
  const [autoMode, setAutoMode] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsConfigured, setSmsConfigured] = useState(false);

  useEffect(() => {
    // Fetch Email-SMS status on component mount
    fetchSMSStatus();
  }, []);

  const fetchSMSStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sms/status');
      const data = await response.json();
      setSmsEnabled(data.enabled);
      setSmsConfigured(data.configured);
    } catch (error) {
      console.error('Failed to fetch Email-SMS status:', error);
    }
  };

  const toggleAutoMode = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/toggle-auto-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !autoMode })
      });
      
      if (response.ok) {
        setAutoMode(!autoMode);
      }
    } catch (error) {
      console.error('Failed to toggle auto mode:', error);
    }
  };

  const toggleSMS = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sms/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !smsEnabled })
      });
      
      if (response.ok) {
        setSmsEnabled(!smsEnabled);
      }
    } catch (error) {
      console.error('Failed to toggle Email-SMS:', error);
    }
  };

  const testSMS = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Test Email-SMS sent successfully! Check your phone.');
      } else {
        alert(`Failed to send test Email-SMS: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to send test Email-SMS:', error);
      alert('Failed to send test Email-SMS. Check console for details.');
    }
  };

  return (
    <div className="bot-controls">
      <h2>🎮 Bot Controls</h2>
      
      {/* Auto Mode Toggle */}
      <div className="auto-mode-section">
        <div className="auto-mode-toggle">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={autoMode}
              onChange={toggleAutoMode}
            />
            <span className="slider"></span>
          </label>
          <span className="toggle-label">
            <strong>Automatic Mode</strong>
            <small>{autoMode ? 'Bot will start/stop automatically' : 'Manual control only'}</small>
          </span>
        </div>
        
        {autoMode && (
          <div className="schedule-info">
            <h4>📅 Automatic Schedule (Eastern Time)</h4>
            <div className="schedule-grid">
              <div className="schedule-item">
                <span className="time">4:00 AM</span>
                <span className="action">🌅 Pre-market Start</span>
              </div>
              <div className="schedule-item">
                <span className="time">9:30 AM</span>
                <span className="action">🌞 Market Hours Start</span>
              </div>
              <div className="schedule-item">
                <span className="time">4:00 PM</span>
                <span className="action">🔚 Auto Stop & Report</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SMS Notifications Section */}
      <div className="sms-section">
        <h3>📱 SMS Notifications</h3>
        <div className="sms-controls">
          <div className="sms-toggle">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={smsEnabled}
                onChange={toggleSMS}
                disabled={!smsConfigured}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">
              <strong>SMS Alerts</strong>
              <small>
                {!smsConfigured 
                  ? 'Configure email-to-SMS credentials in .env file' 
                  : smsEnabled 
                    ? 'Get SMS via email gateway for all trades and events' 
                    : 'Email-to-SMS notifications disabled'
                }
              </small>
            </span>
          </div>
          
          {smsConfigured && (
            <div className="sms-actions">
              <button 
                className="test-sms-button"
                onClick={testSMS}
                disabled={!smsEnabled}
              >
                📱 Send Test Email-SMS
              </button>
            </div>
          )}
          
          {!smsConfigured && (
            <div className="sms-setup-info">
              <h4>🔧 Setup Instructions:</h4>
              <ol>
                <li>Use your Gmail account (enable 2FA)</li>
                <li>Generate an App Password for Gmail</li>
                <li>Find your carrier's email-to-SMS gateway</li>
                <li>Update EMAIL_USER, EMAIL_APP_PASSWORD, and SMS_EMAIL_ADDRESS in .env</li>
                <li>Restart the server</li>
              </ol>
              <p><strong>📖 See EMAIL_SMS_SETUP_GUIDE.md for detailed instructions</strong></p>
            </div>
          )}
        </div>

        {smsEnabled && smsConfigured && (
          <div className="sms-events-info">
            <h4>📬 You'll receive SMS for:</h4>
            <ul>
              <li>🚀 Bot start/stop events</li>
              <li>🟢 Buy orders executed</li>
              <li>🔴 Sell orders executed</li>
              <li>💰 Win/loss notifications</li>
              <li>📊 Daily trading summary</li>
              <li>⚠️ Error alerts</li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Manual Controls */}
      <div className="controls-grid">
        <button 
          className="control-button start-button"
          onClick={onStart}
          disabled={isRunning || autoMode}
          title={autoMode ? "Disable automatic mode to use manual controls" : ""}
        >
          <span className="btn-icon">🚀</span>
          Start Bot
        </button>

        <button 
          className="control-button stop-button"
          onClick={onStop}
          disabled={!isRunning && autoMode}
        >
          <span className="btn-icon">🛑</span>
          Stop Bot
        </button>

        <button 
          className="control-button close-button"
          onClick={onCloseAll}
        >
          <span className="btn-icon">🔴</span>
          Close All Positions
        </button>
      </div>

      <div className="control-info">
        <div className="info-item">
          <strong>Automated Schedule:</strong>
          <ul>
            <li>🌅 Pre-market: 4:00 AM ET</li>
            <li>🌞 Market hours: 9:30 AM ET</li>
            <li>🔚 Market close: 4:00 PM ET</li>
          </ul>
        </div>
        
        <div className="info-item">
          <strong>100% Account Allocation:</strong>
          <p>Bot deploys entire account balance, split evenly among all qualifying stocks each day.</p>
        </div>

        <div className="info-item">
          <strong>MACD Filtering:</strong>
          <p>All trades require bullish MACD signals. Positions auto-close if MACD turns bearish.</p>
        </div>
      </div>
    </div>
  );
};

export default BotControls;
