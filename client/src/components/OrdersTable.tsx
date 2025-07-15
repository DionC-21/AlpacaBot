import React from 'react';

interface Order {
  id: string;
  symbol: string;
  qty: string;
  side: 'buy' | 'sell';
  order_type: string;
  status: string;
  filled_qty?: string;
  limit_price?: string;
  stop_price?: string;
  submitted_at: string;
}

interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const formatCurrency = (value: string | undefined) => {
    if (!value) return '-';
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numValue);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filled': return '#10b981';
      case 'pending_new': 
      case 'new': return '#f59e0b';
      case 'canceled': return '#6b7280';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'buy' ? '#10b981' : '#ef4444';
  };

  // Ensure orders is always an array
  const ordersArray = Array.isArray(orders) ? orders : [];

  if (ordersArray.length === 0) {
    return (
      <div className="orders-table">
        <h2>📋 Recent Orders</h2>
        <div className="empty-state">
          <p>No recent orders</p>
          <small>Order history will appear here</small>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-table">
      <h2>📋 Recent Orders ({ordersArray.length})</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ordersArray.slice(0, 20).map((order, index) => (
              <tr key={index}>
                <td className="time-cell">
                  {formatTime(order.submitted_at)}
                </td>
                <td className="symbol-cell">
                  <strong>{order.symbol}</strong>
                </td>
                <td>
                  <span 
                    className="side-badge"
                    style={{ color: getSideColor(order.side) }}
                  >
                    {order.side.toUpperCase()}
                  </span>
                </td>
                <td className="type-cell">
                  {order.order_type}
                </td>
                <td>
                  {order.qty}
                  {order.filled_qty && order.filled_qty !== '0' && (
                    <small className="filled-qty">
                      / {order.filled_qty} filled
                    </small>
                  )}
                </td>
                <td>
                  {order.limit_price && formatCurrency(order.limit_price)}
                  {order.stop_price && (
                    <small className="stop-price">
                      Stop: {formatCurrency(order.stop_price)}
                    </small>
                  )}
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="orders-summary">
        <div className="summary-stats">
          <div className="stat">
            <strong>Total Orders:</strong> {ordersArray.length}
          </div>
          <div className="stat">
            <strong>Buy Orders:</strong> 
            {ordersArray.filter(order => order.side === 'buy').length}
          </div>
          <div className="stat">
            <strong>Sell Orders:</strong> 
            {ordersArray.filter(order => order.side === 'sell').length}
          </div>
          <div className="stat">
            <strong>Filled:</strong> 
            {ordersArray.filter(order => order.status === 'filled').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
