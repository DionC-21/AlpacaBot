import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import BotControls from './components/BotControls';
import PositionsTable from './components/PositionsTable';
import QualifyingStocks from './components/QualifyingStocks';
import OrdersTable from './components/OrdersTable';
import ScheduleStatus from './components/ScheduleStatus';
import ScannerStatus from './components/ScannerStatus';
import LiveClock from './components/LiveClock';
import TradeLog from './components/TradeLog';
import './App.css';

interface BotStatus {
  isRunning: boolean;
  currentSession: string;
  lastUpdate: string | null;
  positions: any[];
  todayPnL: number;
  accountValue: number;
  qualifyingStocks: any[];
  scheduledJobs: {
    premarket: any;
    market: any;
    cleanup: any;
  };
}

interface Message {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

function App() {
  const [socket, setSocket] = useState<any>(null);
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isRunning: false,
    currentSession: 'closed',
    lastUpdate: null,
    positions: [],
    todayPnL: 0,
    accountValue: 0,
    qualifyingStocks: [],
    scheduledJobs: {
      premarket: null,
      market: null,
      cleanup: null
    }
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tradelog'>('dashboard');

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Listen for bot status updates
    newSocket.on('botStatus', (status: BotStatus) => {
      setBotStatus(status);
    });

    // Listen for messages
    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev.slice(-4), message]); // Keep last 5 messages
    });

    // Listen for daily reports
    newSocket.on('dailyReport', (report: any) => {
      console.log('Daily Report:', report);
      setMessages(prev => [...prev.slice(-4), {
        type: 'info',
        text: `Daily Report: P&L: $${report.totalPnL?.toFixed(2) || '0.00'}`
      }]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const startBot = () => {
    if (socket) {
      socket.emit('startBot');
    }
  };

  const stopBot = () => {
    if (socket) {
      socket.emit('stopBot');
    }
  };

  const closeAllPositions = () => {
    if (socket && window.confirm('Are you sure you want to close all positions?')) {
      socket.emit('closeAllPositions');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orders');
      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    // Fetch orders periodically
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 Automated Ross Cameron Trading Bot</h1>
        <p>Real-time Pre-market & Market Hours Trading with 100% Account Allocation</p>
      </header>

      <div className="main-container">
        {/* Live ET Clock */}
        <LiveClock />

        {/* Messages */}
        {messages.length > 0 && (
          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message message-${message.type}`}>
                {message.text}
              </div>
            ))}
          </div>
        )}

        {/* Dashboard */}
        <Dashboard botStatus={botStatus} />

        {/* Bot Controls */}
        <BotControls 
          isRunning={botStatus.isRunning}
          onStart={startBot}
          onStop={stopBot}
          onCloseAll={closeAllPositions}
        />

        {/* Schedule Status */}
        <ScheduleStatus currentSession={botStatus.currentSession} />

        {/* Scanner Status with Timer */}
        <ScannerStatus 
          isRunning={botStatus.isRunning}
          currentSession={botStatus.currentSession}
        />

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'tradelog' ? 'active' : ''}`}
            onClick={() => setActiveTab('tradelog')}
          >
            Trade Log & Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="content-grid">
            <div className="left-column">
              {/* Qualifying Stocks */}
              <QualifyingStocks stocks={botStatus.qualifyingStocks} />
              
              {/* Positions */}
              <PositionsTable positions={botStatus.positions} />
            </div>

            <div className="right-column">
              {/* Orders */}
              <OrdersTable orders={orders} />
            </div>
          </div>
        )}

        {activeTab === 'tradelog' && (
          <TradeLog />
        )}
      </div>
    </div>
  );
}

export default App;
