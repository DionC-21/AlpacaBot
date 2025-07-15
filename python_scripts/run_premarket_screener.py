#!/usr/bin/env python3
"""
Pre-market screener script for Node.js integration
Returns JSON list of qualifying stocks
"""

import sys
import json
import yfinance as yf
import pandas as pd
import pandas_ta as ta
from datetime import datetime, time as dt_time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PreMarketScreener:
    def __init__(self):
        self.penny_stocks = [
            'SONN', 'DARE', 'SQFT', 'BKKT', 'PHUN', 'DWAC', 'PROG', 'ATER',
            'GNUS', 'SNDL', 'NAKD', 'EXPR', 'CLOV', 'WISH', 'SKLZ', 'PLTR',
            'AMC', 'GME', 'BB', 'NOK', 'KOSS', 'MVIS', 'OCGN', 'CTRM',
            'ZOM', 'JAGX', 'ONTX', 'SHIP', 'EAST', 'ADMP', 'BOXL', 'CORZ',
            'VERB', 'KPTI', 'RMED', 'VYNE', 'GTHX', 'MARA', 'RIOT', 'BTBT'
        ]
    
    def get_current_session(self):
        now = datetime.now().time()
        if dt_time(4, 0) <= now < dt_time(9, 30):
            return 'premarket'
        elif dt_time(9, 30) <= now < dt_time(16, 0):
            return 'market'
        else:
            return 'closed'
    
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
    
    def check_technical_confluence(self, ticker, current_price):
        indicators = self.calculate_technical_indicators(ticker)
        
        if indicators is None:
            return False, None
        
        try:
            # Price above VWAP (momentum)
            above_vwap = current_price > indicators['VWAP']
            
            # Price above 9-EMA (short-term bullish)
            above_9ema = current_price > indicators['EMA_9']
            
            # 9-EMA above 20-EMA (trend alignment)
            ema_alignment = indicators['EMA_9'] > indicators['EMA_20']
            
            # 20-EMA above 200-EMA (long-term uptrend)
            long_term_uptrend = indicators['EMA_20'] > indicators['EMA_200']
            
            # MACD bullish (CRITICAL FILTER)
            macd_bullish = self.is_macd_bullish(indicators)
            
            # All conditions must be true
            all_conditions = [
                above_vwap,
                above_9ema, 
                ema_alignment,
                long_term_uptrend,
                macd_bullish  # CRITICAL - if false, reject trade
            ]
            
            return all(all_conditions), indicators
            
        except Exception as e:
            print(f"Error checking technical confluence for {ticker}: {e}", file=sys.stderr)
            return False, None
    
    def screen_stock(self, ticker):
        try:
            # Get current stock data
            stock = yf.Ticker(ticker)
            hist = stock.history(period='2d', prepost=True)
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            
            # Calculate percentage change
            change_percent = ((current_price - prev_close) / prev_close) * 100
            
            # Get volume
            current_volume = hist['Volume'].iloc[-1]
            
            # Ross Cameron criteria for pre-market
            ross_criteria_met = (
                0.50 <= current_price <= 20.0 and
                change_percent >= 15.0 and  # Pre-market threshold
                current_volume >= 50000  # Pre-market volume threshold
            )
            
            if not ross_criteria_met:
                return None
            
            # Check technical confluence
            technical_ok, indicators = self.check_technical_confluence(ticker, current_price)
            
            if not technical_ok:
                return None
            
            return {
                'symbol': ticker,
                'price': float(current_price),
                'change_percent': float(change_percent),
                'volume': int(current_volume),
                'session': 'premarket',
                'indicators': {
                    'vwap': float(indicators['VWAP']) if indicators is not None else None,
                    'ema_9': float(indicators['EMA_9']) if indicators is not None else None,
                    'ema_20': float(indicators['EMA_20']) if indicators is not None else None,
                    'ema_200': float(indicators['EMA_200']) if indicators is not None else None,
                    'macd': float(indicators['MACD']) if indicators is not None else None,
                    'macd_signal': float(indicators['MACD_Signal']) if indicators is not None else None,
                    'macd_bullish': self.is_macd_bullish(indicators) if indicators is not None else False
                }
            }
            
        except Exception as e:
            print(f"Error screening {ticker}: {e}", file=sys.stderr)
            return None
    
    def run_screening(self):
        qualifying_stocks = []
        
        print(f"🔍 Screening {len(self.penny_stocks)} stocks for pre-market opportunities...", file=sys.stderr)
        
        for ticker in self.penny_stocks:
            result = self.screen_stock(ticker)
            if result:
                qualifying_stocks.append(result)
                print(f"✅ {ticker}: ${result['price']:.2f} (+{result['change_percent']:.1f}%)", file=sys.stderr)
        
        # Sort by percentage change (highest first)
        qualifying_stocks.sort(key=lambda x: x['change_percent'], reverse=True)
        
        print(f"📊 Found {len(qualifying_stocks)} qualifying stocks for pre-market", file=sys.stderr)
        
        return qualifying_stocks

def main():
    screener = PreMarketScreener()
    
    # Check if we're in pre-market hours
    session = screener.get_current_session()
    if session != 'premarket':
        print(f"⚠️ Not in pre-market hours (current session: {session})", file=sys.stderr)
    
    # Run screening
    qualifying_stocks = screener.run_screening()
    
    # Output JSON to stdout for Node.js consumption
    print(json.dumps(qualifying_stocks, indent=2))

if __name__ == "__main__":
    main()
