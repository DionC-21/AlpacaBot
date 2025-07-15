#!/usr/bin/env python3
"""
Market Hours Screener - Ross Cameron style momentum screening for regular market hours
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime
import yfinance as yf
import pandas as pd
import pandas_ta as ta

# Add parent directory to path for imports
parent_dir = Path(__file__).parent.parent
sys.path.append(str(parent_dir))

from config import Config

class MarketHoursScreener:
    def __init__(self):
        self.penny_stocks = [
            'SONN', 'DARE', 'SQFT', 'BKKT', 'PHUN', 'DWAC', 'PROG', 'ATER',
            'GNUS', 'SNDL', 'NAKD', 'EXPR', 'CLOV', 'WISH', 'SKLZ', 'PLTR',
            'AMC', 'GME', 'BB', 'NOK', 'KOSS', 'MVIS', 'OCGN', 'CTRM',
            'ZOM', 'JAGX', 'ONTX', 'SHIP', 'EAST', 'ADMP', 'BOXL', 'CORZ',
            'VERB', 'KPTI', 'RMED', 'VYNE', 'GTHX', 'MARA', 'RIOT', 'BTBT',
            'XELA', 'SENS', 'DATS', 'INPX', 'IBIO', 'IMMP', 'GSAT', 'APRN'
        ]
    
    def screen_stocks(self, criteria):
        """Screen stocks based on Ross Cameron criteria"""
        qualifying_stocks = []
        
        for ticker in self.penny_stocks:
            try:
                stock_data = self.analyze_stock(ticker, criteria)
                if stock_data and stock_data['qualifies']:
                    qualifying_stocks.append(stock_data)
                    
            except Exception as e:
                print(f"Error analyzing {ticker}: {str(e)}", file=sys.stderr)
                continue
        
        return qualifying_stocks
    
    def analyze_stock(self, ticker, criteria):
        """Analyze individual stock against criteria"""
        try:
            # Get current stock data
            stock = yf.Ticker(ticker)
            info = stock.info
            hist = stock.history(period='1d', interval='1m')
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            volume = hist['Volume'].sum()
            open_price = hist['Open'].iloc[0]
            
            # Calculate change percentage
            change_percent = ((current_price - open_price) / open_price) * 100
            
            # Check Ross Cameron criteria
            price_ok = criteria['min_price'] <= current_price <= criteria['max_price']
            change_ok = change_percent >= criteria['min_change_percent']
            volume_ok = volume >= criteria['min_volume']
            
            qualifies = price_ok and change_ok and volume_ok
            
            # Get technical indicators if qualifying
            technical_score = 0
            if qualifies:
                technical_score = self.calculate_technical_score(ticker, hist)
            
            return {
                'symbol': ticker,
                'price': float(current_price),
                'change_percent': float(change_percent),
                'volume': int(volume),
                'qualifies': qualifies,
                'technical_score': technical_score,
                'market_cap': info.get('marketCap', 0),
                'avg_volume': info.get('averageVolume', 0)
            }
            
        except Exception as e:
            return None
    
    def calculate_technical_score(self, ticker, hist_data):
        """Calculate technical analysis score"""
        try:
            # Basic scoring based on available data
            score = 0
            
            if len(hist_data) < 20:
                return 0
            
            # Calculate basic indicators
            data = hist_data.copy()
            data['VWAP'] = ta.vwap(data['High'], data['Low'], data['Close'], data['Volume'])
            data['EMA_9'] = ta.ema(data['Close'], length=9)
            data['EMA_20'] = ta.ema(data['Close'], length=20)
            
            current_price = data['Close'].iloc[-1]
            vwap = data['VWAP'].iloc[-1]
            ema_9 = data['EMA_9'].iloc[-1]
            ema_20 = data['EMA_20'].iloc[-1]
            
            # Price above VWAP (30 points)
            if current_price > vwap:
                score += 30
            
            # Price above EMAs (30 points)
            if current_price > ema_9 > ema_20:
                score += 30
            
            # Volume analysis (40 points)
            avg_volume = data['Volume'].rolling(20).mean().iloc[-1]
            current_volume = data['Volume'].iloc[-1]
            if current_volume > avg_volume * 2:
                score += 40
            elif current_volume > avg_volume * 1.5:
                score += 20
            
            return min(score, 100)
            
        except:
            return 0

def run_market_hours_screener():
    """Run market hours screening with enhanced criteria"""
    try:
        screener = MarketHoursScreener()
        
        # Market hours criteria (stricter than pre-market)
        criteria = {
            'min_price': 0.50,
            'max_price': 20.0,
            'min_change_percent': 15.0,  # 15% minimum change
            'min_volume': 200000,        # Higher volume requirement
            'session': 'market'
        }
        
        # Get qualifying stocks
        qualifying_stocks = screener.screen_stocks(criteria)
        
        # Sort by technical score and change percentage
        qualifying_stocks.sort(key=lambda x: (x.get('technical_score', 0), x.get('change_percent', 0)), reverse=True)
        
        # Limit to top 10 for focused trading
        top_stocks = qualifying_stocks[:10]
        
        result = {
            'timestamp': datetime.now().isoformat(),
            'session': 'market',
            'total_scanned': len(screener.penny_stocks),
            'qualifying_stocks': top_stocks,
            'criteria': criteria,
            'success': True
        }
        
        return result
        
    except Exception as e:
        error_result = {
            'timestamp': datetime.now().isoformat(),
            'session': 'market',
            'error': True,
            'message': str(e),
            'qualifying_stocks': [],
            'success': False
        }
        return error_result

def main():
    """Main function to run market hours screener and return results as JSON"""
    try:
        result = run_market_hours_screener()
        print(json.dumps(result, indent=2))
        
        if not result.get('success', False):
            sys.exit(1)
        
    except Exception as e:
        error_response = {
            'error': True,
            'message': f"Market hours screener failed: {str(e)}",
            'qualifying_stocks': [],
            'success': False
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
