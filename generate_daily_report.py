#!/usr/bin/env python3
"""
Generate daily trading report
Returns trading performance as JSON
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path for imports
parent_dir = Path(__file__).parent.parent
sys.path.append(str(parent_dir))

import alpaca_trade_api as tradeapi
from config import Config

def generate_daily_report():
    """Generate daily trading performance report"""
    try:
        # Initialize Alpaca API
        api = tradeapi.REST(
            Config.ALPACA_API_KEY,
            Config.ALPACA_SECRET_KEY,
            Config.ALPACA_BASE_URL,
            api_version='v2'
        )
        
        # Get today's date range
        today = datetime.now().date()
        start_time = datetime.combine(today, datetime.min.time())
        end_time = datetime.combine(today, datetime.max.time())
        
        # Get account info
        account = api.get_account()
        
        # Get today's orders
        orders = api.list_orders(
            status='all',
            after=start_time.isoformat(),
            until=end_time.isoformat()
        )
        
        # Get positions
        positions = api.list_positions()
        
        # Calculate daily statistics
        total_trades = len([o for o in orders if o.filled_qty and float(o.filled_qty) > 0])
        buy_orders = len([o for o in orders if o.side == 'buy' and o.filled_qty and float(o.filled_qty) > 0])
        sell_orders = len([o for o in orders if o.side == 'sell' and o.filled_qty and float(o.filled_qty) > 0])
        
        # Calculate P&L from filled orders
        daily_pnl = 0
        trade_volume = 0
        
        for order in orders:
            if order.filled_qty and float(order.filled_qty) > 0:
                if order.filled_avg_price:
                    trade_value = float(order.filled_qty) * float(order.filled_avg_price)
                    trade_volume += trade_value
        
        # Get unrealized P&L from current positions
        unrealized_pnl = sum(float(pos.unrealized_pl or 0) for pos in positions)
        
        # Prepare report
        report = {
            'date': today.isoformat(),
            'account_value': float(account.portfolio_value),
            'buying_power': float(account.buying_power),
            'cash': float(account.cash),
            'equity': float(account.equity),
            'unrealized_pl': float(account.unrealized_pl or 0),
            'unrealized_plpc': float(account.unrealized_plpc or 0),
            'day_trade_count': int(account.day_trade_count or 0),
            
            'daily_stats': {
                'total_trades': total_trades,
                'buy_orders': buy_orders,
                'sell_orders': sell_orders,
                'trade_volume': trade_volume,
                'unrealized_pnl': unrealized_pnl
            },
            
            'positions': [{
                'symbol': pos.symbol,
                'qty': float(pos.qty),
                'market_value': float(pos.market_value or 0),
                'unrealized_pl': float(pos.unrealized_pl or 0),
                'unrealized_plpc': float(pos.unrealized_plpc or 0)
            } for pos in positions],
            
            'recent_orders': [{
                'symbol': order.symbol,
                'side': order.side,
                'qty': float(order.qty or 0),
                'filled_qty': float(order.filled_qty or 0),
                'status': order.status,
                'submitted_at': order.submitted_at.isoformat() if order.submitted_at else None,
                'filled_at': order.filled_at.isoformat() if order.filled_at else None,
                'filled_avg_price': float(order.filled_avg_price) if order.filled_avg_price else None
            } for order in orders[-10:]],  # Last 10 orders
            
            'summary': {
                'total_positions': len(positions),
                'total_market_value': sum(float(pos.market_value or 0) for pos in positions),
                'portfolio_change_today': float(account.unrealized_pl or 0),
                'portfolio_change_percent': float(account.unrealized_plpc or 0)
            }
        }
        
        return report
        
    except Exception as e:
        error_info = {
            'error': True,
            'message': str(e),
            'type': type(e).__name__,
            'date': datetime.now().date().isoformat(),
            'account_value': 0,
            'daily_stats': {
                'total_trades': 0,
                'buy_orders': 0,
                'sell_orders': 0
            }
        }
        return error_info

def main():
    """Main function to generate daily report and return as JSON"""
    try:
        report = generate_daily_report()
        print(json.dumps(report, indent=2))
        
    except Exception as e:
        error_response = {
            'error': True,
            'message': f"Failed to generate daily report: {str(e)}"
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
