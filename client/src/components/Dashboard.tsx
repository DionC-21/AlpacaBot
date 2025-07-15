import React from 'react';

interface BotStatus {
  isRunning: boolean;
  currentSession: string;
  lastUpdate: string | null;
  positions: any[];
  todayPnL: number;
  accountValue: number;
  qualifyingStocks: any[];
}

interface DashboardProps {
  botStatus: BotStatus;
}

const Dashboard: React.FC<DashboardProps> = ({ botStatus }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const percent = (value / botStatus.accountValue) * 100;
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getStatusColor = () => {
    if (!botStatus.isRunning) return '#6b7280';
    switch (botStatus.currentSession) {
      case 'premarket': return '#f59e0b';
      case 'market': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSessionLabel = () => {
    switch (botStatus.currentSession) {
      case 'premarket': return '🌅 Pre-Market';
      case 'market': return '🌞 Market Hours';
      case 'closed': return '🌙 Market Closed';
      case 'manual_stop': return '🛑 Manually Stopped';
      default: return '⏸️ Idle';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Bot Status</h3>
            <div 
              className="status-indicator"
              style={{ backgroundColor: getStatusColor() }}
            />
          </div>
          <div className="stat-value">
            {getSessionLabel()}
          </div>
          <div className="stat-label">
            {botStatus.isRunning ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Account Value</h3>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-value">
            {formatCurrency(botStatus.accountValue)}
          </div>
          <div className="stat-label">
            Total Portfolio Value
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Today's P&L</h3>
            <span className="stat-icon">
              {botStatus.todayPnL >= 0 ? '📈' : '📉'}
            </span>
          </div>
          <div 
            className="stat-value"
            style={{ color: botStatus.todayPnL >= 0 ? '#10b981' : '#ef4444' }}
          >
            {formatCurrency(botStatus.todayPnL)}
          </div>
          <div className="stat-label">
            {formatPercent(botStatus.todayPnL)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Open Positions</h3>
            <span className="stat-icon">📊</span>
          </div>
          <div className="stat-value">
            {botStatus.positions.length}
          </div>
          <div className="stat-label">
            Active Trades
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Qualifying Stocks</h3>
            <span className="stat-icon">🎯</span>
          </div>
          <div className="stat-value">
            {botStatus.qualifyingStocks.length}
          </div>
          <div className="stat-label">
            Meeting Criteria Today
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Last Update</h3>
            <span className="stat-icon">🕐</span>
          </div>
          <div className="stat-value">
            {botStatus.lastUpdate ? 
              new Date(botStatus.lastUpdate).toLocaleTimeString() : 
              'Never'
            }
          </div>
          <div className="stat-label">
            System Status
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
