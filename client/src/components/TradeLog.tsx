import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, startOfDay, isSameDay } from 'date-fns';

interface Trade {
  id: string;
  timestamp: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  value: number;
  pnl?: number;
  session: 'premarket' | 'market';
  strategy: string;
}

interface DailyStats {
  date: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  volume: number;
}

const TradeLog: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/trades');
      const data = await response.json();
      setTrades(data.trades || []);
      generateDailyStats(data.trades || []);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyStats = (tradeData: Trade[]) => {
    const dailyMap = new Map<string, DailyStats>();

    tradeData.forEach(trade => {
      const date = format(parseISO(trade.timestamp), 'yyyy-MM-dd');
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalPnL: 0,
          winRate: 0,
          avgWin: 0,
          avgLoss: 0,
          volume: 0
        });
      }

      const dayStats = dailyMap.get(date)!;
      
      if (trade.action === 'SELL' && trade.pnl !== undefined) {
        dayStats.totalTrades++;
        dayStats.totalPnL += trade.pnl;
        dayStats.volume += trade.value;

        if (trade.pnl > 0) {
          dayStats.winningTrades++;
        } else {
          dayStats.losingTrades++;
        }
      }
    });

    // Calculate derived metrics
    dailyMap.forEach(stats => {
      stats.winRate = stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0;
      
      const wins = tradeData.filter(t => 
        format(parseISO(t.timestamp), 'yyyy-MM-dd') === stats.date && 
        t.action === 'SELL' && 
        (t.pnl || 0) > 0
      );
      const losses = tradeData.filter(t => 
        format(parseISO(t.timestamp), 'yyyy-MM-dd') === stats.date && 
        t.action === 'SELL' && 
        (t.pnl || 0) < 0
      );

      stats.avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length : 0;
      stats.avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / losses.length : 0;
    });

    setDailyStats(Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date)));
  };

  const getTradesForDate = (date: string) => {
    return trades.filter(trade => 
      format(parseISO(trade.timestamp), 'yyyy-MM-dd') === date
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  if (loading) {
    return (
      <div className="trade-log loading">
        <h2>📊 Trade Log & Analytics</h2>
        <div className="loading-state">Loading trade data...</div>
      </div>
    );
  }

  return (
    <div className="trade-log">
      <div className="trade-log-header">
        <h2>📊 Trade Log & Analytics</h2>
        <div className="trade-log-controls">
          <button 
            className={`view-toggle ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋 Table View
          </button>
          <button 
            className={`view-toggle ${viewMode === 'charts' ? 'active' : ''}`}
            onClick={() => setViewMode('charts')}
          >
            📈 Charts View
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="table-view">
          {/* Daily Summary */}
          <div className="daily-summary-section">
            <h3>📈 Daily Performance Summary</h3>
            <div className="summary-table-container">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Trades</th>
                    <th>Win Rate</th>
                    <th>Total P&L</th>
                    <th>Avg Win</th>
                    <th>Avg Loss</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.map((stats, index) => (
                    <tr 
                      key={stats.date} 
                      className={selectedDate === stats.date ? 'selected' : ''}
                      onClick={() => setSelectedDate(stats.date)}
                    >
                      <td>{format(parseISO(stats.date), 'MMM dd, yyyy')}</td>
                      <td>{stats.totalTrades}</td>
                      <td className={stats.winRate >= 50 ? 'positive' : 'negative'}>
                        {formatPercent(stats.winRate)}
                      </td>
                      <td className={stats.totalPnL >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(stats.totalPnL)}
                      </td>
                      <td className="positive">{formatCurrency(stats.avgWin)}</td>
                      <td className="negative">{formatCurrency(stats.avgLoss)}</td>
                      <td>{formatCurrency(stats.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Trades for Selected Date */}
          <div className="detailed-trades-section">
            <h3>🔍 Trades for {format(parseISO(selectedDate), 'MMMM dd, yyyy')}</h3>
            <div className="trades-table-container">
              <table className="trades-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Symbol</th>
                    <th>Action</th>
                    <th>Shares</th>
                    <th>Price</th>
                    <th>Value</th>
                    <th>P&L</th>
                    <th>Session</th>
                  </tr>
                </thead>
                <tbody>
                  {getTradesForDate(selectedDate).map((trade, index) => (
                    <tr key={`${trade.timestamp}-${index}`}>
                      <td>{format(parseISO(trade.timestamp), 'HH:mm:ss')}</td>
                      <td className="symbol-cell">
                        <strong>{trade.symbol}</strong>
                      </td>
                      <td>
                        <span className={`action-badge ${trade.action.toLowerCase()}`}>
                          {trade.action}
                        </span>
                      </td>
                      <td>{trade.shares}</td>
                      <td>{formatCurrency(trade.price)}</td>
                      <td>{formatCurrency(trade.value)}</td>
                      <td className={trade.pnl ? (trade.pnl >= 0 ? 'positive' : 'negative') : ''}>
                        {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                      </td>
                      <td>
                        <span className={`session-badge ${trade.session}`}>
                          {trade.session === 'premarket' ? '🌅' : '🌞'} {trade.session}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="charts-view">
          {/* P&L Over Time Chart */}
          <div className="chart-section">
            <h3>📈 Daily P&L Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    labelFormatter={(date) => format(parseISO(date), 'MMMM dd, yyyy')}
                    formatter={(value: number) => [formatCurrency(value), 'P&L']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalPnL" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win Rate Chart */}
          <div className="chart-section">
            <h3>🎯 Win Rate Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyStats.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                  />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    labelFormatter={(date) => format(parseISO(date), 'MMMM dd, yyyy')}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
                  />
                  <Bar dataKey="winRate" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Volume Chart */}
          <div className="chart-section">
            <h3>💰 Daily Trading Volume</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyStats.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    labelFormatter={(date) => format(parseISO(date), 'MMMM dd, yyyy')}
                    formatter={(value: number) => [formatCurrency(value), 'Volume']}
                  />
                  <Bar dataKey="volume" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeLog;
