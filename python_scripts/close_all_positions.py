#!/usr/bin/env python3
"""
Close all positions in Alpaca account
Returns results as JSON
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

def close_all_positions():
    """Close all open positions"""
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
        
        if not positions:
            return {
                'success': True,
                'message': 'No positions to close',
                'closed_positions': 0,
                'positions': []
            }
        
        # Close all positions
        closed_positions = []
        failed_positions = []
        
        for position in positions:
            try:
                # Submit market order to close position
                order = api.submit_order(
                    symbol=position.symbol,
                    qty=abs(float(position.qty)),
                    side='sell' if float(position.qty) > 0 else 'buy',
                    type='market',
                    time_in_force='day'
                )
                
                closed_positions.append({
                    'symbol': position.symbol,
                    'qty': float(position.qty),
                    'market_value': float(position.market_value),
                    'order_id': order.id,
                    'status': 'submitted'
                })
                
            except Exception as e:
                failed_positions.append({
                    'symbol': position.symbol,
                    'qty': float(position.qty),
                    'error': str(e)
                })
        
        return {
            'success': len(failed_positions) == 0,
            'message': f'Closed {len(closed_positions)} positions, {len(failed_positions)} failed',
            'closed_positions': len(closed_positions),
            'failed_positions': len(failed_positions),
            'positions': closed_positions,
            'failures': failed_positions
        }
        
    except Exception as e:
        error_info = {
            'success': False,
            'error': True,
            'message': str(e),
            'type': type(e).__name__,
            'closed_positions': 0
        }
        return error_info

def main():
    """Main function to close all positions and return as JSON"""
    try:
        result = close_all_positions()
        print(json.dumps(result, indent=2))
        
        if not result.get('success', False):
            sys.exit(1)
        
    except Exception as e:
        error_response = {
            'success': False,
            'error': True,
            'message': f"Failed to close positions: {str(e)}"
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
