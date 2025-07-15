import React from 'react';

interface Position {
  symbol: string;
  qty: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price?: string;
  avg_entry_price?: string;
}

interface PositionsTableProps {
  positions: Position[];
}

const PositionsTable: React.FC<PositionsTableProps> = ({ positions }) => {
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numValue);
  };

  const formatPercent = (value: string) => {
    const numValue = parseFloat(value) * 100;
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  // Ensure positions is always an array
  const positionsArray = Array.isArray(positions) ? positions : [];

  if (positionsArray.length === 0) {
    return (
      <div className="positions-table">
        <h2>📊 Open Positions</h2>
        <div className="empty-state">
          <p>No open positions</p>
          <small>Positions will appear here when the bot makes trades</small>
        </div>
      </div>
    );
  }

  return (
    <div className="positions-table">
      <h2>📊 Open Positions ({positionsArray.length})</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Shares</th>
              <th>Entry Price</th>
              <th>Current Price</th>
              <th>Market Value</th>
              <th>P&L</th>
              <th>P&L %</th>
            </tr>
          </thead>
          <tbody>
            {positionsArray.map((position, index) => {
              const pnl = parseFloat(position.unrealized_pl);
              const pnlPercent = parseFloat(position.unrealized_plpc);
              
              return (
                <tr key={index}>
                  <td className="symbol-cell">
                    <strong>{position.symbol}</strong>
                  </td>
                  <td>{position.qty}</td>
                  <td>
                    {position.avg_entry_price ? 
                      formatCurrency(position.avg_entry_price) : 
                      '-'
                    }
                  </td>
                  <td>
                    {position.current_price ? 
                      formatCurrency(position.current_price) : 
                      '-'
                    }
                  </td>
                  <td>{formatCurrency(position.market_value)}</td>
                  <td 
                    className={pnl >= 0 ? 'positive' : 'negative'}
                  >
                    {formatCurrency(position.unrealized_pl)}
                  </td>
                  <td 
                    className={pnlPercent >= 0 ? 'positive' : 'negative'}
                  >
                    {formatPercent(position.unrealized_plpc)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-summary">
        <div className="summary-item">
          <strong>Total Positions:</strong> {positionsArray.length}
        </div>
        <div className="summary-item">
          <strong>Total Market Value:</strong> 
          {formatCurrency(
            positionsArray.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0)
          )}
        </div>
        <div className="summary-item">
          <strong>Total P&L:</strong> 
          <span className={
            positionsArray.reduce((sum, pos) => sum + parseFloat(pos.unrealized_pl), 0) >= 0 
              ? 'positive' : 'negative'
          }>
            {formatCurrency(
              positionsArray.reduce((sum, pos) => sum + parseFloat(pos.unrealized_pl), 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PositionsTable;
