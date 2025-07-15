#!/usr/bin/env python3
"""
Monitor positions script for Node.js integration
Monitors MACD and other indicators for open positions
"""

import sys
import json
import alpaca_trade_api as tradeapi
import yfinance as yf
import pandas_ta as ta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PositionMonitor:
    def __init__(self):
        self.api = tradeapi.REST(
            os.getenv('ALPACA_API_KEY'),
            os.getenv('ALPACA_SECRET_KEY'),
            base_url=os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')
        )
    
    def get_open_positions(self):
        return self.api.list_positions()
    
    def calculate_technical_indicators(self, ticker):
        try:
            # Get 1-minute data for technical analysis
            data = yf.download(ticker, period='1d', interval='1m', prepost=True, progress=False)
            
            if data.empty or len(data) < 200:
                return None
            
            # Calculate indicators
            data['VWAP'] = ta.vwap(data['High'], data['Low'], data['Close'], data['Volume'])
            data['EMA_9'] = ta.ema(data['Close'], length=9)
            data['EMA_20'] = ta.ema(data['Close'], length=20)
            data['EMA_200'] = ta.ema(data['Close'], length=200)
            
            # MACD calculation
            macd_data = ta.macd(data['Close'])
            data['MACD'] = macd_data['MACD_12_26_9']
            data['MACD_Signal'] = macd_data['MACDs_12_26_9']
            data['MACD_Histogram'] = macd_data['MACDh_12_26_9']
            
            return data.iloc[-1]  # Return latest values
            
        except Exception as e:
            print(f"Error calculating indicators for {ticker}: {e}", file=sys.stderr)
            return None
    
    def is_macd_bullish(self, indicators):
        try:
            macd = indicators['MACD']
            macd_signal = indicators['MACD_Signal']
            macd_histogram = indicators['MACD_Histogram']
            
            # MACD must be above signal line (bullish crossover)
            macd_above_signal = macd > macd_signal
            
            # MACD histogram should be positive (strengthening)
            histogram_positive = macd_histogram > 0
            
            # Both conditions must be true
            return macd_above_signal and histogram_positive
            
        except:
            return False
    
    def close_position_immediately(self, symbol, reason):
        try:
            # Cancel all open orders for this symbol
            orders = self.api.list_orders(status='open', symbols=[symbol])
            for order in orders:
                self.api.cancel_order(order.id)
            
            # Close the position
            position = self.api.get_position(symbol)
            if position.qty != '0':
                self.api.close_position(symbol)
                print(f"🔴 Closed position {symbol} due to {reason}", file=sys.stderr)
                return True
            
        except Exception as e:
            print(f"Error closing position {symbol}: {e}", file=sys.stderr)
            return False
        
        return False
    
    def monitor_positions(self):
        positions = self.get_open_positions()
        
        results = {
            'positions_monitored': len(positions),
            'positions_closed': 0,
            'warnings': [],
            'status_updates': []
        }
        
        print(f"📊 Monitoring {len(positions)} open positions", file=sys.stderr)
        
        for position in positions:
            symbol = position.symbol
            current_price = float(position.market_value) / float(position.qty) if float(position.qty) != 0 else 0
            
            print(f"🔍 Checking {symbol} at ${current_price:.2f}", file=sys.stderr)
            
            # Get latest indicators
            indicators = self.calculate_technical_indicators(symbol)
            
            if indicators is None:
                results['warnings'].append(f"Could not get indicators for {symbol}")
                continue
            
            # Check if MACD turned bearish
            macd_bullish = self.is_macd_bullish(indicators)
            
            if not macd_bullish:
                print(f"⚠️ MACD turned bearish for {symbol} - CLOSING POSITION", file=sys.stderr)
                
                if self.close_position_immediately(symbol, "MACD_BEARISH"):
                    results['positions_closed'] += 1
                    results['status_updates'].append({
                        'symbol': symbol,
                        'action': 'closed',
                        'reason': 'MACD_BEARISH',
                        'price': current_price
                    })
            else:
                # Check other indicators for early warnings
                try:
                    vwap = indicators['VWAP']
                    
                    if current_price < vwap:
                        results['warnings'].append(f"{symbol} below VWAP - weakness detected")
                        print(f"⚠️ {symbol} below VWAP - weakness detected", file=sys.stderr)
                    
                    results['status_updates'].append({
                        'symbol': symbol,
                        'action': 'monitored',
                        'price': current_price,
                        'macd_bullish': macd_bullish,
                        'above_vwap': current_price > vwap,
                        'indicators': {
                            'vwap': float(vwap),
                            'macd': float(indicators['MACD']),
                            'macd_signal': float(indicators['MACD_Signal'])
                        }
                    })
                    
                except Exception as e:
                    print(f"Error processing indicators for {symbol}: {e}", file=sys.stderr)
        
        print(f"📈 Monitoring complete: {results['positions_closed']} positions closed", file=sys.stderr)
        
        return results

def main():
    monitor = PositionMonitor()
    results = monitor.monitor_positions()
    
    # Output JSON to stdout for Node.js consumption
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
