import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

interface ScannerStatusProps {
  isRunning: boolean;
  currentSession: string;
}

interface ScannerState {
  nextScanIn: number;
  lastScanTime: string | null;
  lastScanResults: number;
  totalScansToday: number;
  totalOpportunities: number;
  scanStatus: 'waiting' | 'scanning' | 'complete' | 'error';
}

const ScannerStatus: React.FC<ScannerStatusProps> = ({ isRunning, currentSession }) => {
  const [scannerState, setScannerState] = useState<ScannerState>({
    nextScanIn: 60,
    lastScanTime: null,
    lastScanResults: 0,
    totalScansToday: 0,
    totalOpportunities: 0,
    scanStatus: 'waiting'
  });

  // Connect to socket for real-time scanner updates
  useEffect(() => {
    const newSocket = io('http://localhost:3001');

    // Listen for real-time status updates
    newSocket.on('realtimeStatus', (data: any) => {
      setScannerState(prev => ({
        ...prev,
        nextScanIn: data.secondsUntilNextMinute,
        totalOpportunities: data.qualifyingStocks
      }));
    });

    // Listen for scanner heartbeat
    newSocket.on('scannerHeartbeat', (data: any) => {
      setScannerState(prev => ({
        ...prev,
        scanStatus: 'scanning'
      }));
    });

    // Listen for scan results
    newSocket.on('scanResults', (data: any) => {
      setScannerState(prev => ({
        ...prev,
        lastScanTime: data.timestamp,
        lastScanResults: data.newOpportunities,
        totalOpportunities: data.totalQualifying,
        totalScansToday: prev.totalScansToday + 1,
        scanStatus: 'complete'
      }));
    });

    // Listen for scanner errors
    newSocket.on('scannerError', (data: any) => {
      setScannerState(prev => ({
        ...prev,
        scanStatus: 'error'
      }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && (currentSession === 'premarket' || currentSession === 'market')) {
      // Update countdown every second
      interval = setInterval(() => {
        setScannerState(prev => {
          const now = new Date();
          const seconds = now.getSeconds();
          const nextScanIn = seconds === 0 ? 60 : 60 - seconds;
          
          // At the start of each minute (seconds === 0), set to waiting for scan
          if (seconds === 0) {
            return {
              ...prev,
              nextScanIn: 60,
              scanStatus: 'waiting'
            };
          }
          
          return {
            ...prev,
            nextScanIn
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentSession]);

  const isActiveSession = currentSession === 'premarket' || currentSession === 'market';
  const showTimer = isRunning && isActiveSession;

  const getScanStatusColor = () => {
    switch (scannerState.scanStatus) {
      case 'scanning': return '#f6ad55';
      case 'complete': return '#38a169';
      case 'error': return '#e53e3e';
      default: return '#3182ce';
    }
  };

  const getScanStatusText = () => {
    switch (scannerState.scanStatus) {
      case 'scanning': return '🔄 SCANNING';
      case 'complete': return '✅ COMPLETE';
      case 'error': return '❌ ERROR';
      default: return '⏳ WAITING';
    }
  };

  return (
    <div className="scanner-status-card">
      <h3>📊 Real-Time Scanner Status</h3>
      
      <div className="scanner-grid">
        <div className="scanner-item">
          <span className="scanner-label">Scanner Status:</span>
          <span className={`scanner-value ${showTimer ? 'active' : 'inactive'}`}>
            {showTimer ? '🟢 ACTIVE' : '🔴 INACTIVE'}
          </span>
        </div>

        <div className="scanner-item">
          <span className="scanner-label">Session:</span>
          <span className="scanner-value session-indicator">
            {currentSession === 'premarket' && '🌅 Pre-Market'}
            {currentSession === 'market' && '📈 Market Hours'}
            {currentSession === 'afterhours' && '🌙 After Hours'}
            {currentSession === 'closed' && '🔒 Market Closed'}
          </span>
        </div>

        {showTimer && (
          <>
            <div className="scanner-item">
              <span className="scanner-label">Next Scan In:</span>
              <span className={`scanner-value countdown ${scannerState.nextScanIn <= 10 ? 'urgent' : ''}`}>
                {scannerState.nextScanIn}s
              </span>
            </div>

            <div className="scanner-item">
              <span className="scanner-label">Scan Status:</span>
              <span 
                className="scanner-value"
                style={{ color: getScanStatusColor() }}
              >
                {getScanStatusText()}
              </span>
            </div>

            <div className="scanner-item">
              <span className="scanner-label">Last Scan:</span>
              <span className="scanner-value">
                {scannerState.lastScanTime || 'Starting...'}
              </span>
            </div>

            <div className="scanner-item">
              <span className="scanner-label">New Opportunities:</span>
              <span className={`scanner-value ${scannerState.lastScanResults > 0 ? 'highlight' : ''}`}>
                {scannerState.lastScanResults}
              </span>
            </div>

            <div className="scanner-item">
              <span className="scanner-label">Total Qualifying:</span>
              <span className="scanner-value">
                {scannerState.totalOpportunities}
              </span>
            </div>

            <div className="scanner-item">
              <span className="scanner-label">Scans Today:</span>
              <span className="scanner-value">
                {scannerState.totalScansToday}
              </span>
            </div>
          </>
        )}
      </div>

      {showTimer && (
        <div className="scanner-progress-bar">
          <div 
            className="scanner-progress-fill"
            style={{ 
              width: `${((60 - scannerState.nextScanIn) / 60) * 100}%` 
            }}
          />
        </div>
      )}

      {!isActiveSession && (
        <div className="scanner-note">
          <p>🕐 Scanner is paused outside trading hours</p>
          <p>Pre-market: 4:00 AM - 9:30 AM EST</p>
          <p>Market hours: 9:30 AM - 4:00 PM EST</p>
          <p>Real-time scanning every 60 seconds during active sessions</p>
        </div>
      )}
    </div>
  );
};

export default ScannerStatus;
