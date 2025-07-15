import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

interface ScheduleStatusProps {
  currentSession: string;
}

interface TradingStatus {
  currentSession: string;
  nextSession: {
    name: string;
    time: string;
  } | null;
  isWeekday: boolean;
  currentTime: string;
  timeZone: string;
}

const ScheduleStatus: React.FC<ScheduleStatusProps> = ({ currentSession }) => {
  const [tradingStatus, setTradingStatus] = useState<TradingStatus | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const fetchTradingStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/trading-status');
      const status = await response.json();
      setTradingStatus(status);
    } catch (error) {
      console.error('Failed to fetch trading status:', error);
    }
  };

  const updateCurrentTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
    setCurrentTime(timeString);
  };

  useEffect(() => {
    fetchTradingStatus();
    updateCurrentTime();
    
    // Connect to socket for real-time updates
    const socket = io('http://localhost:3001');
    
    // Listen for real-time status updates
    socket.on('realtimeStatus', (data: any) => {
      setCurrentTime(data.timestamp);
      if (tradingStatus) {
        setTradingStatus(prev => prev ? {
          ...prev,
          currentSession: data.currentSession,
          currentTime: data.timestamp
        } : null);
      }
    });
    
    // Update time every second for real-time accuracy
    const timeInterval = setInterval(updateCurrentTime, 1000);
    
    // Fetch trading status every 10 seconds to get session changes
    const statusInterval = setInterval(fetchTradingStatus, 10000);

    return () => {
      socket.disconnect();
      clearInterval(timeInterval);
      clearInterval(statusInterval);
    };
  }, []);

  const getSessionDisplay = (session: string) => {
    switch (session) {
      case 'premarket':
        return {
          emoji: '🌅',
          name: 'Pre-Market',
          color: '#f59e0b',
          description: 'Screening and trading penny stocks'
        };
      case 'market':
        return {
          emoji: '🌞',
          name: 'Market Hours',
          color: '#10b981',
          description: 'Active trading session'
        };
      case 'closed':
        return {
          emoji: '🌙',
          name: 'Market Closed',
          color: '#64748b',
          description: 'Next session starts automatically'
        };
      default:
        return {
          emoji: '⏸️',
          name: 'Stopped',
          color: '#ef4444',
          description: 'Manually stopped'
        };
    }
  };

  const sessionInfo = getSessionDisplay(currentSession);

  return (
    <div className="schedule-status">
      <div className="status-header">
        <h2>📅 Schedule Status</h2>
        <div className="current-time">
          <strong>ET:</strong> {currentTime}
        </div>
      </div>

      <div className="status-grid">
        <div className="current-session">
          <div className="session-indicator" style={{ backgroundColor: sessionInfo.color }}>
            <span className="session-emoji">{sessionInfo.emoji}</span>
            <div className="session-info">
              <strong>{sessionInfo.name}</strong>
              <small>{sessionInfo.description}</small>
            </div>
          </div>
        </div>

        {tradingStatus?.nextSession && (
          <div className="next-session">
            <h4>🎯 Next Event</h4>
            <div className="next-event">
              <strong>{tradingStatus.nextSession.name}</strong>
              <span>{tradingStatus.nextSession.time}</span>
            </div>
          </div>
        )}
      </div>

      <div className="automatic-schedule">
        <h4>🤖 Automatic Trading Schedule</h4>
        <div className="schedule-timeline">
          <div className="timeline-item">
            <div className="timeline-time">4:00 AM</div>
            <div className="timeline-content">
              <strong>🌅 Pre-Market Start</strong>
              <span>Screen and trade penny stocks</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-time">9:30 AM</div>
            <div className="timeline-content">
              <strong>🌞 Market Hours</strong>
              <span>Enhanced momentum trading</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-time">4:00 PM</div>
            <div className="timeline-content">
              <strong>🔚 Auto Stop</strong>
              <span>Close positions & generate report</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleStatus;