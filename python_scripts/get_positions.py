#!/usr/bin/env python3
"""
Get current positions from Alpaca account
Returns positions as JSON
"""

import json
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
parent_dir = Path(__file__).parent.parent
sys.path.append(str(parent_dir))

import alpaca_trade_api as tradeapi
from config import Config

def get_positions():
    """Get current positions from Alpaca"""
    try:
        # Initialize Alpaca API
        api = tradeapi.REST(
            Config.ALPACA_API_KEY,
            Config.ALPACA_SECRET_KEY,
            Config.ALPACA_BASE_URL,
            api_version='v2'
        )
        
        # Get all positions
        positions = api.list_positions()
        
        # Convert positions to dict format
        positions_data = []
        for position in positions:
            position_info = {
                'symbol': position.symbol,
                'qty': float(position.qty),
                'side': position.side,
                'market_value': float(position.market_value or 0),
                'cost_basis': float(position.cost_basis or 0),
                'unrealized_pl': float(position.unrealized_pl or 0),
                'unrealized_plpc': float(position.unrealized_plpc or 0),
                'unrealized_intraday_pl': float(position.unrealized_intraday_pl or 0),
                'unrealized_intraday_plpc': float(position.unrealized_intraday_plpc or 0),
                'current_price': float(position.current_price or 0),
                'lastday_price': float(position.lastday_price or 0),
                'change_today': float(position.change_today or 0),
                'avg_entry_price': float(position.avg_entry_price or 0),
                'exchange': position.exchange,
                'asset_id': position.asset_id,
                'asset_class': position.asset_class
            }
            positions_data.append(position_info)
        
        return {
            'positions': positions_data,
            'total_positions': len(positions_data),
            'total_market_value': sum(p['market_value'] for p in positions_data),
            'total_unrealized_pl': sum(p['unrealized_pl'] for p in positions_data)
        }
        
    except Exception as e:
        error_info = {
            'error': True,
            'message': str(e),
            'type': type(e).__name__,
            'positions': [],
            'total_positions': 0
        }
        return error_info

def main():
    """Main function to get positions and return as JSON"""
    try:
        positions_info = get_positions()
        print(json.dumps(positions_info, indent=2))
        
    except Exception as e:
        error_response = {
            'error': True,
            'message': f"Failed to get positions: {str(e)}",
            'positions': []
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
