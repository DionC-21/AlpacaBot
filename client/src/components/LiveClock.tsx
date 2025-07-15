import React, { useState, useEffect } from 'react';

const LiveClock: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Convert to ET (Eastern Time)
      const etTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(now);

      const etDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(now);

      setTime(etTime);
      setDate(etDate);
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const getMarketStatus = () => {
    const now = new Date();
    const etHour = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false
    }).format(now);
    
    const etMinute = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      minute: 'numeric'
    }).format(now);

    const hour = parseInt(etHour);
    const minute = parseInt(etMinute);
    const dayOfWeek = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short'
    }).format(now);

    const isWeekday = !['Sat', 'Sun'].includes(dayOfWeek);

    if (!isWeekday) {
      return { status: 'Weekend', color: '#718096', icon: '🏖️' };
    }

    // Market hours: 9:30 AM - 4:00 PM ET
    if (hour >= 4 && hour < 9) {
      return { status: 'Pre-Market', color: '#f6ad55', icon: '🌅' };
    } else if (hour === 9 && minute < 30) {
      return { status: 'Pre-Market', color: '#f6ad55', icon: '🌅' };
    } else if ((hour === 9 && minute >= 30) || (hour >= 10 && hour < 16)) {
      return { status: 'Market Open', color: '#38a169', icon: '📈' };
    } else if (hour >= 16 && hour < 20) {
      return { status: 'After Hours', color: '#9f7aea', icon: '🌙' };
    } else {
      return { status: 'Market Closed', color: '#e53e3e', icon: '🔒' };
    }
  };

  const marketStatus = getMarketStatus();

  return (
    <div className="live-clock">
      <div className="clock-display">
        <div className="time-display">
          <span className="time">{time}</span>
          <span className="timezone">ET</span>
        </div>
        <div className="date-display">{date}</div>
      </div>
      
      <div className="market-status" style={{ color: marketStatus.color }}>
        <span className="status-icon">{marketStatus.icon}</span>
        <span className="status-text">{marketStatus.status}</span>
      </div>
    </div>
  );
};

export default LiveClock;
