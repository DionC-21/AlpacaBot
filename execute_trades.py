#!/usr/bin/env python3
"""
Execute trades script for Node.js integration
Takes trade parameters as JSON input and executes trades
"""

import sys
import json
import alpaca_trade_api as tradeapi
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TradeExecutor:
    def __init__(self):
        self.api = tradeapi.REST(
            os.getenv('ALPACA_API_KEY'),
            os.getenv('ALPACA_SECRET_KEY'),
            base_url=os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')
        )
    
    def get_account_info(self):
        return self.api.get_account()
    
    def calculate_position_sizes(self, stocks, account_value):
        if not stocks:
            return {}
        
        # Split account evenly among all qualifying stocks (100% allocation)
        allocation_per_stock = account_value / len(stocks)
        
        position_sizes = {}
        for stock in stocks:
            shares = int(allocation_per_stock / stock['price'])
            
            position_sizes[stock['symbol']] = {
                'shares': shares,
                'allocation': allocation_per_stock,
                'price': stock['price'],
                'total_value': shares * stock['price']
            }
        
        return position_sizes
    
    def place_buy_order(self, symbol, shares, price, session):
        try:
            if session == 'premarket':
                # Use limit order for pre-market
                order = self.api.submit_order(
                    symbol=symbol,
                    qty=shares,
                    side='buy',
                    type='limit',
                    limit_price=round(price * 1.002, 2),  # Small buffer
                    time_in_force='day',
                    extended_hours=True
                )
            else:
                # Use market order for regular hours
                order = self.api.submit_order(
                    symbol=symbol,
                    qty=shares,
                    side='buy',
                    type='market',
                    time_in_force='day'
                )
            
            return order
            
        except Exception as e:
            print(f"Error placing buy order for {symbol}: {e}", file=sys.stderr)
            return None
    
    def place_profit_targets(self, symbol, shares, entry_price, session):
        profit_tiers = [
            {'level': 10, 'sell_pct': 25},  # 25% at +10%
            {'level': 20, 'sell_pct': 25},  # 25% at +20%
            {'level': 30, 'sell_pct': 25},  # 25% at +30%
            {'level': 40, 'sell_pct': 25}   # 25% at +40%
        ]
        
        orders = []
        
        for tier in profit_tiers:
            try:
                sell_qty = int(shares * (tier['sell_pct'] / 100))
                target_price = round(entry_price * (1 + tier['level'] / 100), 2)
                
                order = self.api.submit_order(
                    symbol=symbol,
                    qty=sell_qty,
                    side='sell',
                    type='limit',
                    limit_price=target_price,
                    time_in_force='day',
                    extended_hours=(session == 'premarket')
                )
                
                orders.append(order)
                
            except Exception as e:
                print(f"Error placing profit target for {symbol}: {e}", file=sys.stderr)
        
        return orders
    
    def place_stop_loss(self, symbol, shares, entry_price):
        try:
            stop_price = round(entry_price * 0.95, 2)  # 5% stop loss
            
            order = self.api.submit_order(
                symbol=symbol,
                qty=shares,
                side='sell',
                type='stop',
                stop_price=stop_price,
                time_in_force='day'
            )
            
            return order
            
        except Exception as e:
            print(f"Error placing stop loss for {symbol}: {e}", file=sys.stderr)
            return None
    
    def execute_trades(self, trade_params):
        stocks = trade_params['stocks']
        session = trade_params['session']
        
        print(f"🚀 Executing trades for {len(stocks)} stocks in {session} session", file=sys.stderr)
        
        # Get account info
        account = self.get_account_info()
        account_value = float(account.buying_power)
        
        print(f"💰 Available buying power: ${account_value:,.2f}", file=sys.stderr)
        
        # Calculate position sizes (100% allocation)
        position_sizes = self.calculate_position_sizes(stocks, account_value)
        
        results = {
            'successful_trades': 0,
            'failed_trades': 0,
            'trades': [],
            'total_allocated': 0
        }
        
        for stock in stocks:
            symbol = stock['symbol']
            
            if symbol not in position_sizes:
                continue
            
            position = position_sizes[symbol]
            shares = position['shares']
            price = position['price']
            
            if shares <= 0:
                print(f"⚠️ Skipping {symbol}: calculated 0 shares", file=sys.stderr)
                continue
            
            print(f"📈 Trading {symbol}: {shares} shares at ${price:.2f} (${position['total_value']:.2f})", file=sys.stderr)
            
            # Place buy order
            buy_order = self.place_buy_order(symbol, shares, price, session)
            
            if buy_order:
                # Place profit targets
                profit_orders = self.place_profit_targets(symbol, shares, price, session)
                
                # Place stop loss
                stop_order = self.place_stop_loss(symbol, shares, price)
                
                trade_result = {
                    'symbol': symbol,
                    'shares': shares,
                    'entry_price': price,
                    'allocation': position['allocation'],
                    'buy_order_id': buy_order.id,
                    'profit_order_ids': [order.id for order in profit_orders],
                    'stop_order_id': stop_order.id if stop_order else None,
                    'session': session,
                    'timestamp': buy_order.submitted_at
                }
                
                results['trades'].append(trade_result)
                results['successful_trades'] += 1
                results['total_allocated'] += position['total_value']
                
                print(f"✅ {symbol} trade executed successfully", file=sys.stderr)
                
            else:
                results['failed_trades'] += 1
                print(f"❌ Failed to execute trade for {symbol}", file=sys.stderr)
        
        print(f"📊 Trade execution complete: {results['successful_trades']} successful, {results['failed_trades']} failed", file=sys.stderr)
        print(f"💵 Total allocated: ${results['total_allocated']:,.2f}", file=sys.stderr)
        
        return results

def main():
    # Read input from stdin
    input_data = sys.stdin.read()
    
    try:
        trade_params = json.loads(input_data)
    except json.JSONDecodeError:
        print("Error: Invalid JSON input", file=sys.stderr)
        sys.exit(1)
    
    executor = TradeExecutor()
    results = executor.execute_trades(trade_params)
    
    # Output JSON to stdout for Node.js consumption
    print(json.dumps(results, indent=2, default=str))

if __name__ == "__main__":
    main()
