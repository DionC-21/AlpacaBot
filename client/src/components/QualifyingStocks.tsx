import React from 'react';

interface QualifyingStock {
  symbol: string;
  price: number;
  change_percent: number;
  volume: number;
  session: string;
  indicators: {
    vwap?: number;
    ema_9?: number;
    ema_20?: number;
    ema_200?: number;
    macd?: number;
    macd_signal?: number;
    macd_bullish: boolean;
  };
}

interface QualifyingStocksProps {
  stocks: QualifyingStock[];
}

const QualifyingStocks: React.FC<QualifyingStocksProps> = ({ stocks }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Ensure stocks is always an array
  const stocksArray = Array.isArray(stocks) ? stocks : [];

  if (stocksArray.length === 0) {
    return (
      <div className="qualifying-stocks">
        <h2>🎯 Qualifying Stocks</h2>
        <div className="empty-state">
          <p>No qualifying stocks found</p>
          <small>Stocks meeting Ross Cameron + Technical criteria will appear here</small>
        </div>
      </div>
    );
  }

  return (
    <div className="qualifying-stocks">
      <h2>🎯 Qualifying Stocks ({stocksArray.length})</h2>
      
      <div className="stocks-grid">
        {stocksArray.map((stock, index) => (
          <div key={index} className="stock-card">
            <div className="stock-header">
              <div className="stock-symbol">
                <strong>{stock.symbol}</strong>
                <span className="session-badge">
                  {stock.session === 'premarket' ? '🌅' : '🌞'}
                </span>
              </div>
              <div className="stock-price">
                {formatCurrency(stock.price)}
              </div>
            </div>

            <div className="stock-metrics">
              <div className="metric">
                <span className="metric-label">Change:</span>
                <span 
                  className={`metric-value ${stock.change_percent >= 0 ? 'positive' : 'negative'}`}
                >
                  {formatPercent(stock.change_percent)}
                </span>
              </div>
              
              <div className="metric">
                <span className="metric-label">Volume:</span>
                <span className="metric-value">
                  {formatVolume(stock.volume)}
                </span>
              </div>
            </div>

            <div className="technical-indicators">
              <div className="indicator-row">
                <span className="indicator-label">VWAP:</span>
                <span className="indicator-value">
                  {stock.indicators.vwap ? formatCurrency(stock.indicators.vwap) : 'N/A'}
                </span>
                <span className={`indicator-status ${stock.price > (stock.indicators.vwap || 0) ? 'positive' : 'negative'}`}>
                  {stock.price > (stock.indicators.vwap || 0) ? '✅' : '❌'}
                </span>
              </div>

              <div className="indicator-row">
                <span className="indicator-label">9-EMA:</span>
                <span className="indicator-value">
                  {stock.indicators.ema_9 ? formatCurrency(stock.indicators.ema_9) : 'N/A'}
                </span>
                <span className={`indicator-status ${stock.price > (stock.indicators.ema_9 || 0) ? 'positive' : 'negative'}`}>
                  {stock.price > (stock.indicators.ema_9 || 0) ? '✅' : '❌'}
                </span>
              </div>

              <div className="indicator-row">
                <span className="indicator-label">MACD:</span>
                <span className="indicator-value">
                  {stock.indicators.macd ? stock.indicators.macd.toFixed(4) : 'N/A'}
                </span>
                <span className={`indicator-status ${stock.indicators.macd_bullish ? 'positive' : 'negative'}`}>
                  {stock.indicators.macd_bullish ? '🟢' : '🔴'}
                </span>
              </div>
            </div>

            <div className="stock-footer">
              <div className="allocation-info">
                <small>
                  Ready for 100% allocation strategy
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="qualifying-summary">
        <div className="summary-stats">
          <div className="stat">
            <strong>Total Qualifying:</strong> {stocks.length}
          </div>
          <div className="stat">
            <strong>Allocation per Stock:</strong> 
            {stocks.length > 0 ? ` ${(100 / stocks.length).toFixed(1)}%` : ' 0%'}
          </div>
          <div className="stat">
            <strong>Average Change:</strong> 
            {stocks.length > 0 ? 
              formatPercent(stocks.reduce((sum, stock) => sum + stock.change_percent, 0) / stocks.length) : 
              '0%'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifyingStocks;
