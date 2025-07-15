#!/usr/bin/env python3
"""
Get Alpaca account information
Returns account details as JSON
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

def get_account_info():
    """Get account information from Alpaca"""
    try:
        # Initialize Alpaca API
        api = tradeapi.REST(
            Config.ALPACA_API_KEY,
            Config.ALPACA_SECRET_KEY,
            Config.ALPACA_BASE_URL,
            api_version='v2'
        )
        
        # Get account information
        account = api.get_account()
        
        # Extract relevant information
        account_info = {
            'account_id': account.id,
            'status': account.status,
            'currency': account.currency,
            'buying_power': float(account.buying_power),
            'cash': float(account.cash),
            'portfolio_value': float(account.portfolio_value),
            'equity': float(account.equity),
            'last_equity': float(account.last_equity),
            'long_market_value': float(account.long_market_value or 0),
            'short_market_value': float(account.short_market_value or 0),
            'unrealized_pl': float(account.unrealized_pl or 0),
            'unrealized_plpc': float(account.unrealized_plpc or 0),
            'initial_margin': float(account.initial_margin or 0),
            'maintenance_margin': float(account.maintenance_margin or 0),
            'day_trade_count': int(account.day_trade_count or 0),
            'daytrade_buying_power': float(account.daytrade_buying_power or 0),
            'pattern_day_trader': account.pattern_day_trader,
            'trade_suspended_by_user': account.trade_suspended_by_user,
            'trading_blocked': account.trading_blocked,
            'transfers_blocked': account.transfers_blocked,
            'account_blocked': account.account_blocked,
            'created_at': account.created_at.isoformat() if account.created_at else None,
            'updated_at': account.updated_at.isoformat() if account.updated_at else None
        }
        
        return account_info
        
    except Exception as e:
        error_info = {
            'error': True,
            'message': str(e),
            'type': type(e).__name__
        }
        return error_info

def main():
    """Main function to get account info and return as JSON"""
    try:
        account_info = get_account_info()
        print(json.dumps(account_info, indent=2))
        
    except Exception as e:
        error_response = {
            'error': True,
            'message': f"Failed to get account info: {str(e)}"
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
