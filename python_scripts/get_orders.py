#!/usr/bin/env python3
"""
Get orders from Alpaca account
Returns orders as JSON
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

def get_orders():
    """Get recent orders from Alpaca"""
    try:
        # Initialize Alpaca API
        api = tradeapi.REST(
            Config.ALPACA_API_KEY,
            Config.ALPACA_SECRET_KEY,
            Config.ALPACA_BASE_URL,
            api_version='v2'
        )
        
        # Get orders from the last 7 days
        until = datetime.now()
        after = until - timedelta(days=7)
        
        orders = api.list_orders(
            status='all',
            limit=100,
            after=after.isoformat(),
            until=until.isoformat(),
            direction='desc'
        )
        
        # Convert orders to dict format
        orders_data = []
        for order in orders:
            order_info = {
                'id': order.id,
                'client_order_id': order.client_order_id,
                'symbol': order.symbol,
                'asset_id': order.asset_id,
                'asset_class': order.asset_class,
                'qty': float(order.qty or 0),
                'filled_qty': float(order.filled_qty or 0),
                'side': order.side,
                'order_type': order.order_type,
                'time_in_force': order.time_in_force,
                'limit_price': float(order.limit_price) if order.limit_price else None,
                'stop_price': float(order.stop_price) if order.stop_price else None,
                'status': order.status,
                'extended_hours': order.extended_hours,
                'legs': order.legs,
                'trail_percent': float(order.trail_percent) if order.trail_percent else None,
                'trail_price': float(order.trail_price) if order.trail_price else None,
                'hwm': float(order.hwm) if order.hwm else None,
                'submitted_at': order.submitted_at.isoformat() if order.submitted_at else None,
                'filled_at': order.filled_at.isoformat() if order.filled_at else None,
                'expired_at': order.expired_at.isoformat() if order.expired_at else None,
                'canceled_at': order.canceled_at.isoformat() if order.canceled_at else None,
                'failed_at': order.failed_at.isoformat() if order.failed_at else None,
                'replaced_at': order.replaced_at.isoformat() if order.replaced_at else None,
                'replaced_by': order.replaced_by,
                'replaces': order.replaces,
                'filled_avg_price': float(order.filled_avg_price) if order.filled_avg_price else None
            }
            orders_data.append(order_info)
        
        return {
            'orders': orders_data,
            'total_orders': len(orders_data)
        }
        
    except Exception as e:
        error_info = {
            'error': True,
            'message': str(e),
            'type': type(e).__name__,
            'orders': [],
            'total_orders': 0
        }
        return error_info

def main():
    """Main function to get orders and return as JSON"""
    try:
        orders_info = get_orders()
        print(json.dumps(orders_info, indent=2))
        
    except Exception as e:
        error_response = {
            'error': True,
            'message': f"Failed to get orders: {str(e)}",
            'orders': []
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
