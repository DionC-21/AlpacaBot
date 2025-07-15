#!/usr/bin/env python3
"""
SELL ALL POSITIONS
Closes all open positions in Alpaca account
"""

import alpaca_trade_api as tradeapi
from config import API_KEY, SECRET_KEY, BASE_URL
from datetime import datetime

class PositionCloser:
    def __init__(self):
        # Initialize Alpaca API
        self.api = tradeapi.REST(API_KEY, SECRET_KEY, BASE_URL, api_version='v2')
    
    def get_all_positions(self):
        """Get all current positions"""
        try:
            positions = self.api.list_positions()
            return positions
        except Exception as e:
            print(f"❌ Error getting positions: {e}")
            return []
    
    def close_position(self, position):
        """Close a specific position"""
        try:
            symbol = position.symbol
            qty = abs(float(position.qty))  # Use absolute value in case of short positions
            side = 'sell' if float(position.qty) > 0 else 'buy'  # Sell long, buy to cover short
            
            # Place market order to close position
            order = self.api.submit_order(
                symbol=symbol,
                qty=qty,
                side=side,
                type='market',
                time_in_force='day'
            )
            
            current_value = float(position.market_value)
            unrealized_pl = float(position.unrealized_pl)
            
            print(f"✅ CLOSED: {symbol}")
            print(f"   Shares: {qty}")
            print(f"   Market Value: ${current_value:.2f}")
            print(f"   P&L: ${unrealized_pl:+.2f}")
            
            return {
                'symbol': symbol,
                'qty': qty,
                'side': side,
                'market_value': current_value,
                'pnl': unrealized_pl,
                'order': order
            }
            
        except Exception as e:
            print(f"❌ Error closing position {position.symbol}: {e}")
            return None
    
    def close_all_positions(self):
        """Close all open positions"""
        print("🚨 CLOSING ALL POSITIONS")
        print("=" * 50)
        
        # Get all positions
        positions = self.get_all_positions()
        
        if not positions:
            print("✅ No open positions to close.")
            return
        
        print(f"📊 Found {len(positions)} open positions:")
        
        # Show current positions
        total_value = 0
        total_pnl = 0
        
        for pos in positions:
            market_value = float(pos.market_value)
            unrealized_pl = float(pos.unrealized_pl)
            total_value += market_value
            total_pnl += unrealized_pl
            
            print(f"   {pos.symbol}: {pos.qty} shares, ${market_value:.2f} ({unrealized_pl:+.2f})")
        
        print(f"\n💰 Total Portfolio:")
        print(f"   Market Value: ${total_value:.2f}")
        print(f"   Unrealized P&L: ${total_pnl:+.2f}")
        
        # Confirmation
        response = input(f"\n🚨 Close ALL {len(positions)} positions? (y/N): ").strip().lower()
        if response != 'y':
            print("❌ Operation cancelled.")
            return
        
        # Close all positions
        print(f"\n🔄 Closing positions...")
        closed_positions = []
        
        for i, position in enumerate(positions, 1):
            print(f"\n📈 Closing position {i}/{len(positions)}:")
            result = self.close_position(position)
            
            if result:
                closed_positions.append(result)
                # Log the close
                self.log_close(result)
        
        # Summary
        print(f"\n🏁 CLOSING SUMMARY:")
        print(f"   Positions Closed: {len(closed_positions)}/{len(positions)}")
        
        if closed_positions:
            total_realized_pnl = sum(pos['pnl'] for pos in closed_positions)
            print(f"   Total Realized P&L: ${total_realized_pnl:+.2f}")
            
            if total_realized_pnl > 0:
                print("🎉 Profitable session!")
            elif total_realized_pnl < 0:
                print("📉 Loss realized - learn and improve!")
            else:
                print("➖ Break-even session")
        
        return closed_positions
    
    def log_close(self, close_result):
        """Log the position close to CSV"""
        try:
            with open('trade_log.csv', 'a') as f:
                # Write trade data
                timestamp = datetime.now().isoformat()
                f.write(f"{timestamp},{close_result['symbol']},SELL,"
                       f"{close_result['qty']},MARKET,"
                       f"{close_result['market_value']:.2f},,,"
                       f"{close_result['pnl']:+.2f},CLOSE_POSITION\\n")
                       
        except Exception as e:
            print(f"⚠️  Error logging close: {e}")

def main():
    closer = PositionCloser()
    
    print("🚨 POSITION CLOSER")
    print("This will close ALL open positions")
    print("=" * 40)
    
    closer.close_all_positions()

if __name__ == "__main__":
    main()
