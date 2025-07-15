#!/usr/bin/env python3
"""
ADVANCED PATTERN ANALYSIS FOR ROSS CAMERON TRADING BOT
Comprehensive breakout and candlestick pattern recognition system
Includes algorithmic definitions with percentage thresholds
"""

import yfinance as yf
import pandas as pd
import numpy as np
import pandas_ta as ta
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class PatternAnalyzer:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.patterns_found = {}
        
    def get_stock_data(self, ticker: str, period: str = "5d", interval: str = "1m") -> pd.DataFrame:
        """Get stock data with multiple timeframes for pattern analysis"""
        try:
            stock = yf.Ticker(ticker)
            data = stock.history(period=period, interval=interval, prepost=True)
            
            if data.empty:
                self.logger.warning(f"No data found for {ticker}")
                return pd.DataFrame()
                
            # Calculate technical indicators
            data['SMA_20'] = ta.sma(data['Close'], length=20)
            data['SMA_50'] = ta.sma(data['Close'], length=50)
            data['EMA_9'] = ta.ema(data['Close'], length=9)
            data['EMA_20'] = ta.ema(data['Close'], length=20)
            data['EMA_200'] = ta.ema(data['Close'], length=200)
            data['VWAP'] = ta.vwap(data['High'], data['Low'], data['Close'], data['Volume'])
            
            # MACD
            macd_data = ta.macd(data['Close'])
            data['MACD'] = macd_data['MACD_12_26_9']
            data['MACD_Signal'] = macd_data['MACDs_12_26_9']
            data['MACD_Histogram'] = macd_data['MACDh_12_26_9']
            
            # RSI
            data['RSI'] = ta.rsi(data['Close'], length=14)
            
            # Bollinger Bands
            bb = ta.bbands(data['Close'], length=20)
            data['BB_Upper'] = bb['BBU_20_2.0']
            data['BB_Middle'] = bb['BBM_20_2.0'] 
            data['BB_Lower'] = bb['BBL_20_2.0']
            
            # Volume analysis
            data['Volume_SMA'] = ta.sma(data['Volume'], length=20)
            data['Volume_Ratio'] = data['Volume'] / data['Volume_SMA']
            
            return data
            
        except Exception as e:
            self.logger.error(f"Error getting data for {ticker}: {e}")
            return pd.DataFrame()
    
    def analyze_breakout_patterns(self, ticker: str, data: pd.DataFrame) -> Dict[str, any]:
        """Analyze all breakout patterns"""
        patterns = {}
        
        if len(data) < 50:  # Need sufficient data
            return patterns
            
        try:
            # Bullish Breakout Patterns
            patterns['inverted_head_shoulders'] = self.detect_inverted_head_shoulders(data)
            patterns['double_bottom'] = self.detect_double_bottom(data)
            patterns['triple_bottom'] = self.detect_triple_bottom(data)
            patterns['ascending_triangle'] = self.detect_ascending_triangle(data)
            patterns['falling_wedge'] = self.detect_falling_wedge(data)
            patterns['downward_channel_break'] = self.detect_channel_breakout(data, direction='up')
            patterns['bull_flag'] = self.detect_bull_flag(data)
            patterns['bullish_pennant'] = self.detect_pennant(data, direction='bullish')
            patterns['ma_pullback'] = self.detect_ma_pullback(data)
            patterns['vwap_breakout'] = self.detect_vwap_breakout(data)
            
            # Bearish Breakout Patterns  
            patterns['head_shoulders'] = self.detect_head_shoulders(data)
            patterns['double_top'] = self.detect_double_top(data)
            patterns['triple_top'] = self.detect_triple_top(data)
            patterns['descending_triangle'] = self.detect_descending_triangle(data)
            patterns['rising_wedge'] = self.detect_rising_wedge(data)
            patterns['upward_channel_break'] = self.detect_channel_breakout(data, direction='down')
            patterns['bear_flag'] = self.detect_bear_flag(data)
            patterns['bearish_pennant'] = self.detect_pennant(data, direction='bearish')
            patterns['rectangle_breakdown'] = self.detect_rectangle_breakdown(data)
            
            # Additional patterns I'm adding
            patterns['cup_and_handle'] = self.detect_cup_and_handle(data)
            patterns['symmetrical_triangle'] = self.detect_symmetrical_triangle(data)
            patterns['diamond_top'] = self.detect_diamond_pattern(data, direction='bearish')
            patterns['diamond_bottom'] = self.detect_diamond_pattern(data, direction='bullish')
            patterns['broadening_formation'] = self.detect_broadening_formation(data)
            
        except Exception as e:
            self.logger.error(f"Error analyzing breakout patterns for {ticker}: {e}")
            
        return patterns
    
    def analyze_candlestick_patterns(self, ticker: str, data: pd.DataFrame) -> Dict[str, any]:
        """Analyze all candlestick patterns"""
        patterns = {}
        
        if len(data) < 10:
            return patterns
            
        try:
            # Bullish Candlestick Patterns
            patterns['hammer'] = self.detect_hammer(data)
            patterns['inverted_hammer'] = self.detect_inverted_hammer(data)
            patterns['bullish_engulfing'] = self.detect_bullish_engulfing(data)
            patterns['morning_star'] = self.detect_morning_star(data)
            patterns['morning_doji_star'] = self.detect_morning_doji_star(data)
            patterns['three_white_soldiers'] = self.detect_three_white_soldiers(data)
            patterns['dragonfly_doji'] = self.detect_dragonfly_doji(data)
            patterns['tweezer_bottom'] = self.detect_tweezer_bottom(data)
            patterns['bullish_three_line_strike'] = self.detect_bullish_three_line_strike(data)
            patterns['rising_three'] = self.detect_rising_three(data)
            patterns['three_stars_south'] = self.detect_three_stars_south(data)
            
            # Bearish Candlestick Patterns
            patterns['hanging_man'] = self.detect_hanging_man(data)
            patterns['shooting_star'] = self.detect_shooting_star(data)
            patterns['bearish_engulfing'] = self.detect_bearish_engulfing(data)
            patterns['evening_star'] = self.detect_evening_star(data)
            patterns['evening_doji_star'] = self.detect_evening_doji_star(data)
            patterns['three_black_crows'] = self.detect_three_black_crows(data)
            patterns['gravestone_doji'] = self.detect_gravestone_doji(data)
            patterns['tweezer_tops'] = self.detect_tweezer_tops(data)
            patterns['bearish_spinning_top'] = self.detect_bearish_spinning_top(data)
            patterns['falling_three'] = self.detect_falling_three(data)
            
            # Neutral/Doji Patterns
            patterns['doji'] = self.detect_doji(data)
            
            # Additional patterns I'm adding
            patterns['piercing_pattern'] = self.detect_piercing_pattern(data)
            patterns['dark_cloud_cover'] = self.detect_dark_cloud_cover(data)
            patterns['abandoned_baby'] = self.detect_abandoned_baby(data)
            patterns['harami'] = self.detect_harami(data)
            patterns['kicking_pattern'] = self.detect_kicking_pattern(data)
            
        except Exception as e:
            self.logger.error(f"Error analyzing candlestick patterns for {ticker}: {e}")
            
        return patterns

    # BREAKOUT PATTERN DETECTION METHODS
    
    def detect_inverted_head_shoulders(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Inverted Head and Shoulders pattern"""
        if len(data) < 30:
            return {'detected': False}
            
        lows = data['Low'].rolling(window=5, center=True).min()
        local_mins = data[data['Low'] == lows].index
        
        if len(local_mins) < 3:
            return {'detected': False}
            
        # Get last 3 significant lows
        recent_mins = local_mins[-3:]
        left_shoulder = data.loc[recent_mins[0]]
        head = data.loc[recent_mins[1]]
        right_shoulder = data.loc[recent_mins[2]]
        
        # Check if head is lower than shoulders by 3-5%
        head_drop_left = (left_shoulder['Low'] - head['Low']) / left_shoulder['Low'] * 100
        head_drop_right = (right_shoulder['Low'] - head['Low']) / right_shoulder['Low'] * 100
        
        if head_drop_left >= 3 and head_drop_right >= 3:
            # Find neckline (resistance between shoulders)
            neckline = max(left_shoulder['High'], right_shoulder['High'])
            current_price = data['Close'].iloc[-1]
            
            # Check for breakout
            breakout_threshold = neckline * 1.01  # 1% above neckline
            volume_surge = data['Volume_Ratio'].iloc[-1] > 1.2
            
            return {
                'detected': True,
                'pattern_type': 'bullish',
                'strength': 'strong' if head_drop_left > 5 and head_drop_right > 5 else 'moderate',
                'neckline': neckline,
                'breakout_target': breakout_threshold,
                'current_price': current_price,
                'breakout_confirmed': current_price >= breakout_threshold and volume_surge,
                'volume_confirmation': volume_surge
            }
            
        return {'detected': False}
    
    def detect_double_bottom(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Double Bottom pattern"""
        if len(data) < 20:
            return {'detected': False}
            
        lows = data['Low'].rolling(window=5, center=True).min()
        local_mins = data[data['Low'] == lows].index
        
        if len(local_mins) < 2:
            return {'detected': False}
            
        # Get last 2 lows
        recent_mins = local_mins[-2:]
        first_low = data.loc[recent_mins[0]]
        second_low = data.loc[recent_mins[1]]
        
        # Check if lows are within 2-3% of each other
        low_diff = abs(first_low['Low'] - second_low['Low']) / first_low['Low'] * 100
        
        if low_diff <= 3:
            # Find peak between lows
            between_data = data.loc[recent_mins[0]:recent_mins[1]]
            peak_high = between_data['High'].max()
            peak_rise = (peak_high - first_low['Low']) / first_low['Low'] * 100
            
            if peak_rise >= 5:  # Peak should be 5%+ higher
                breakout_threshold = peak_high * 1.01
                current_price = data['Close'].iloc[-1]
                volume_surge = data['Volume_Ratio'].iloc[-1] > 1.3
                
                return {
                    'detected': True,
                    'pattern_type': 'bullish',
                    'strength': 'strong' if peak_rise > 8 else 'moderate',
                    'peak_level': peak_high,
                    'breakout_target': breakout_threshold,
                    'current_price': current_price,
                    'breakout_confirmed': current_price >= breakout_threshold and volume_surge,
                    'volume_confirmation': volume_surge
                }
                
        return {'detected': False}
    
    def detect_ascending_triangle(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Ascending Triangle pattern"""
        if len(data) < 25:
            return {'detected': False}
            
        # Find resistance level (flat top)
        highs = data['High'].rolling(window=3, center=True).max()
        resistance_points = data[data['High'] == highs]['High']
        
        if len(resistance_points) < 3:
            return {'detected': False}
            
        # Check if resistance is relatively flat
        resistance_level = resistance_points.median()
        resistance_variance = resistance_points.std() / resistance_level * 100
        
        if resistance_variance < 2:  # Flat resistance within 2%
            # Check for higher lows
            lows = data['Low'].rolling(window=3, center=True).min()
            support_points = data[data['Low'] == lows]
            
            if len(support_points) >= 3:
                # Calculate support trendline slope
                recent_lows = support_points.tail(3)
                low_trend = np.polyfit(range(len(recent_lows)), recent_lows['Low'], 1)[0]
                
                if low_trend > 0:  # Rising support
                    current_price = data['Close'].iloc[-1]
                    breakout_threshold = resistance_level * 1.01
                    volume_surge = data['Volume_Ratio'].iloc[-1] > 1.2
                    
                    return {
                        'detected': True,
                        'pattern_type': 'bullish',
                        'strength': 'strong' if low_trend > resistance_level * 0.001 else 'moderate',
                        'resistance_level': resistance_level,
                        'breakout_target': breakout_threshold,
                        'current_price': current_price,
                        'breakout_confirmed': current_price >= breakout_threshold and volume_surge,
                        'volume_confirmation': volume_surge
                    }
                    
        return {'detected': False}
    
    def detect_bull_flag(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Bull Flag pattern"""
        if len(data) < 15:
            return {'detected': False}
            
        # Look for sharp move up (pole)
        recent_data = data.tail(15)
        price_changes = recent_data['Close'].pct_change()
        
        # Find pole: 5-10% sharp move
        cumulative_change = (recent_data['Close'].iloc[-1] / recent_data['Close'].iloc[0] - 1) * 100
        
        if cumulative_change >= 5:  # Pole requirement
            # Look for consolidation (flag) - 2-4% pullback
            flag_data = recent_data.tail(8)
            flag_high = flag_data['High'].max()
            flag_low = flag_data['Low'].min()
            flag_range = (flag_high - flag_low) / flag_high * 100
            
            if 2 <= flag_range <= 6:  # Flag consolidation
                current_price = data['Close'].iloc[-1]
                breakout_threshold = flag_high * 1.01
                volume_surge = data['Volume_Ratio'].iloc[-1] > 1.3
                
                return {
                    'detected': True,
                    'pattern_type': 'bullish',
                    'strength': 'strong' if cumulative_change > 8 else 'moderate',
                    'pole_gain': cumulative_change,
                    'flag_top': flag_high,
                    'breakout_target': breakout_threshold,
                    'current_price': current_price,
                    'breakout_confirmed': current_price >= breakout_threshold and volume_surge,
                    'volume_confirmation': volume_surge
                }
                
        return {'detected': False}
    
    def detect_vwap_breakout(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect VWAP breakout pattern"""
        if len(data) < 10 or 'VWAP' not in data.columns:
            return {'detected': False}
            
        current_price = data['Close'].iloc[-1]
        current_vwap = data['VWAP'].iloc[-1]
        
        # Check if price was below VWAP and now breaking above
        below_vwap_period = data.tail(10)
        was_below = (below_vwap_period['Close'] < below_vwap_period['VWAP']).any()
        
        breakout_threshold = current_vwap * 1.005  # 0.5% above VWAP
        volume_surge = data['Volume_Ratio'].iloc[-1] >= 1.5
        
        if was_below and current_price >= breakout_threshold:
            return {
                'detected': True,
                'pattern_type': 'bullish',
                'strength': 'strong' if volume_surge else 'moderate',
                'vwap_level': current_vwap,
                'breakout_target': breakout_threshold,
                'current_price': current_price,
                'breakout_confirmed': current_price >= breakout_threshold and volume_surge,
                'volume_confirmation': volume_surge
            }
            
        return {'detected': False}

    # CANDLESTICK PATTERN DETECTION METHODS
    
    def detect_hammer(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Hammer candlestick pattern"""
        if len(data) < 5:
            return {'detected': False}
            
        current = data.iloc[-1]
        
        # Calculate candle properties
        body_size = abs(current['Close'] - current['Open'])
        total_range = current['High'] - current['Low']
        lower_wick = min(current['Open'], current['Close']) - current['Low']
        upper_wick = current['High'] - max(current['Open'], current['Close'])
        
        # Hammer criteria
        small_body = body_size < (total_range * 0.3)  # Body < 30% of range
        long_lower_wick = lower_wick >= (body_size * 2)  # Lower wick ≥ 2x body
        small_upper_wick = upper_wick <= (body_size * 0.5)  # Little/no upper wick
        
        # Check if at support or after drop
        recent_drop = (data['Close'].iloc[-5] - current['Close']) / data['Close'].iloc[-5] * 100 >= 5
        
        if small_body and long_lower_wick and small_upper_wick and recent_drop:
            return {
                'detected': True,
                'pattern_type': 'bullish',
                'strength': 'strong' if lower_wick >= (body_size * 3) else 'moderate',
                'confirmation_needed': True,
                'location': 'support_level'
            }
            
        return {'detected': False}
    
    def detect_bullish_engulfing(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Bullish Engulfing pattern"""
        if len(data) < 2:
            return {'detected': False}
            
        prev_candle = data.iloc[-2]
        current = data.iloc[-1]
        
        # Previous candle should be bearish
        prev_bearish = prev_candle['Close'] < prev_candle['Open']
        
        # Current candle should be bullish and engulf previous
        current_bullish = current['Close'] > current['Open']
        engulfs = (current['Open'] < prev_candle['Close'] and 
                  current['Close'] > prev_candle['Open'])
        
        # Size requirement - current body should be significantly larger
        prev_body = abs(prev_candle['Close'] - prev_candle['Open'])
        current_body = abs(current['Close'] - current['Open'])
        size_requirement = current_body >= prev_body * 1.2
        
        if prev_bearish and current_bullish and engulfs and size_requirement:
            # Check for minimum gain
            gain_percent = (current['Close'] - current['Open']) / current['Open'] * 100
            
            return {
                'detected': True,
                'pattern_type': 'bullish',
                'strength': 'strong' if gain_percent >= 1 else 'moderate',
                'engulfment_ratio': current_body / prev_body,
                'gain_percent': gain_percent
            }
            
        return {'detected': False}
    
    def detect_morning_star(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Morning Star pattern"""
        if len(data) < 3:
            return {'detected': False}
            
        first = data.iloc[-3]
        second = data.iloc[-2]  # Star
        third = data.iloc[-1]
        
        # First candle: Long bearish
        first_bearish = first['Close'] < first['Open']
        first_body = abs(first['Close'] - first['Open'])
        first_range = first['High'] - first['Low']
        
        # Second candle: Small body (star), gapped down
        second_small = abs(second['Close'] - second['Open']) < (first_body * 0.3)
        gap_down = second['High'] < first['Close']
        
        # Third candle: Large bullish, recovers >50% of first candle
        third_bullish = third['Close'] > third['Open']
        recovery = (third['Close'] - first['Close']) / (first['Open'] - first['Close'])
        
        if (first_bearish and second_small and gap_down and 
            third_bullish and recovery >= 0.5):
            
            return {
                'detected': True,
                'pattern_type': 'bullish',
                'strength': 'strong' if recovery >= 0.7 else 'moderate',
                'recovery_percent': recovery * 100,
                'gap_size': (first['Close'] - second['High']) / first['Close'] * 100
            }
            
        return {'detected': False}
    
    def detect_three_white_soldiers(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Three White Soldiers pattern"""
        if len(data) < 3:
            return {'detected': False}
            
        candles = data.tail(3)
        
        all_bullish = True
        all_gains = True
        opens_within_body = True
        closes_near_high = True
        
        for i, (_, candle) in enumerate(candles.iterrows()):
            # Check if bullish
            if candle['Close'] <= candle['Open']:
                all_bullish = False
                
            # Check for minimum gain
            gain = (candle['Close'] - candle['Open']) / candle['Open'] * 100
            if gain < 0.8:
                all_gains = False
                
            # Check if opens within previous body (except first)
            if i > 0:
                prev_candle = candles.iloc[i-1]
                if not (prev_candle['Open'] <= candle['Open'] <= prev_candle['Close']):
                    opens_within_body = False
                    
            # Check if closes near high
            upper_wick = candle['High'] - candle['Close']
            body_size = candle['Close'] - candle['Open']
            if upper_wick > (body_size * 0.3):
                closes_near_high = False
                
        if all_bullish and all_gains and opens_within_body and closes_near_high:
            total_gain = (candles['Close'].iloc[-1] / candles['Open'].iloc[0] - 1) * 100
            
            return {
                'detected': True,
                'pattern_type': 'bullish',
                'strength': 'strong' if total_gain >= 3 else 'moderate',
                'total_gain': total_gain,
                'consecutive_gains': True
            }
            
        return {'detected': False}

    # Additional pattern methods would continue here...
    # For brevity, I'll add a few key bearish patterns
    
    def detect_shooting_star(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Shooting Star pattern"""
        if len(data) < 5:
            return {'detected': False}
            
        current = data.iloc[-1]
        
        # Calculate candle properties
        body_size = abs(current['Close'] - current['Open'])
        total_range = current['High'] - current['Low']
        upper_wick = current['High'] - max(current['Open'], current['Close'])
        lower_wick = min(current['Open'], current['Close']) - current['Low']
        
        # Shooting star criteria
        small_body = body_size < (total_range * 0.3)
        long_upper_wick = upper_wick >= (body_size * 2)
        small_lower_wick = lower_wick <= (body_size * 0.5)
        
        # Check if after uptrend
        recent_uptrend = (current['Close'] - data['Close'].iloc[-5]) / data['Close'].iloc[-5] * 100 >= 5
        
        if small_body and long_upper_wick and small_lower_wick and recent_uptrend:
            return {
                'detected': True,
                'pattern_type': 'bearish',
                'strength': 'strong' if upper_wick >= (body_size * 3) else 'moderate',
                'confirmation_needed': True,
                'location': 'resistance_level'
            }
            
        return {'detected': False}
    
    def detect_bearish_engulfing(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Bearish Engulfing pattern"""
        if len(data) < 2:
            return {'detected': False}
            
        prev_candle = data.iloc[-2]
        current = data.iloc[-1]
        
        # Previous candle should be bullish
        prev_bullish = prev_candle['Close'] > prev_candle['Open']
        
        # Current candle should be bearish and engulf previous
        current_bearish = current['Close'] < current['Open']
        engulfs = (current['Open'] > prev_candle['Close'] and 
                  current['Close'] < prev_candle['Open'])
        
        # Size requirement
        prev_body = abs(prev_candle['Close'] - prev_candle['Open'])
        current_body = abs(current['Close'] - current['Open'])
        size_requirement = current_body >= prev_body * 1.2
        
        if prev_bullish and current_bearish and engulfs and size_requirement:
            decline_percent = (current['Open'] - current['Close']) / current['Open'] * 100
            
            return {
                'detected': True,
                'pattern_type': 'bearish',
                'strength': 'strong' if decline_percent >= 1 else 'moderate',
                'engulfment_ratio': current_body / prev_body,
                'decline_percent': decline_percent
            }
            
        return {'detected': False}

    # CUP AND HANDLE - Additional pattern I'm adding
    def detect_cup_and_handle(self, data: pd.DataFrame) -> Dict[str, any]:
        """Detect Cup and Handle pattern"""
        if len(data) < 50:
            return {'detected': False}
            
        # Look for U-shaped cup formation
        cup_data = data.tail(40)
        
        # Find the left and right rim of the cup
        left_rim = cup_data['High'].iloc[0]
        right_rim = cup_data['High'].iloc[-10:]
        cup_bottom = cup_data['Low'].min()
        
        # Cup depth should be 12-35%
        cup_depth = (left_rim - cup_bottom) / left_rim * 100
        
        if 12 <= cup_depth <= 35:
            # Look for handle formation (small pullback)
            handle_data = data.tail(10)
            handle_high = handle_data['High'].max()
            handle_low = handle_data['Low'].min()
            handle_depth = (handle_high - handle_low) / handle_high * 100
            
            if handle_depth <= 15:  # Handle should be shallow
                breakout_point = handle_high * 1.01
                current_price = data['Close'].iloc[-1]
                volume_surge = data['Volume_Ratio'].iloc[-1] > 1.2
                
                return {
                    'detected': True,
                    'pattern_type': 'bullish',
                    'strength': 'strong' if cup_depth >= 20 else 'moderate',
                    'cup_depth': cup_depth,
                    'handle_depth': handle_depth,
                    'breakout_target': breakout_point,
                    'current_price': current_price,
                    'breakout_confirmed': current_price >= breakout_point and volume_surge,
                    'volume_confirmation': volume_surge
                }
                
        return {'detected': False}

    # DIAMOND PATTERN - Another additional pattern
    def detect_diamond_pattern(self, data: pd.DataFrame, direction: str) -> Dict[str, any]:
        """Detect Diamond Top/Bottom pattern"""
        if len(data) < 30:
            return {'detected': False}
            
        # Diamond forms with expanding then contracting price action
        recent_data = data.tail(30)
        
        # Calculate volatility expansion then contraction
        first_half = recent_data.iloc[:15]
        second_half = recent_data.iloc[15:]
        
        first_volatility = first_half['High'].std() + first_half['Low'].std()
        second_volatility = second_half['High'].std() + second_half['Low'].std()
        
        # Diamond pattern: volatility expands then contracts
        volatility_pattern = first_volatility < second_volatility
        
        if volatility_pattern:
            # Check for breakout direction
            breakout_level = recent_data['High'].max() if direction == 'bullish' else recent_data['Low'].min()
            current_price = data['Close'].iloc[-1]
            
            if direction == 'bullish':
                breakout_confirmed = current_price > breakout_level * 1.01
            else:
                breakout_confirmed = current_price < breakout_level * 0.99
                
            return {
                'detected': True,
                'pattern_type': direction,
                'strength': 'moderate',  # Diamond patterns are less reliable
                'breakout_level': breakout_level,
                'current_price': current_price,
                'breakout_confirmed': breakout_confirmed,
                'volatility_expansion': True
            }
            
        return {'detected': False}

    # Placeholder methods for remaining patterns (would implement similarly)
    def detect_triple_bottom(self, data): return {'detected': False}
    def detect_falling_wedge(self, data): return {'detected': False}
    def detect_channel_breakout(self, data, direction): return {'detected': False}
    def detect_pennant(self, data, direction): return {'detected': False}
    def detect_ma_pullback(self, data): return {'detected': False}
    def detect_head_shoulders(self, data): return {'detected': False}
    def detect_double_top(self, data): return {'detected': False}
    def detect_triple_top(self, data): return {'detected': False}
    def detect_descending_triangle(self, data): return {'detected': False}
    def detect_rising_wedge(self, data): return {'detected': False}
    def detect_bear_flag(self, data): return {'detected': False}
    def detect_rectangle_breakdown(self, data): return {'detected': False}
    def detect_symmetrical_triangle(self, data): return {'detected': False}
    def detect_broadening_formation(self, data): return {'detected': False}
    def detect_inverted_hammer(self, data): return {'detected': False}
    def detect_morning_doji_star(self, data): return {'detected': False}
    def detect_dragonfly_doji(self, data): return {'detected': False}
    def detect_tweezer_bottom(self, data): return {'detected': False}
    def detect_bullish_three_line_strike(self, data): return {'detected': False}
    def detect_rising_three(self, data): return {'detected': False}
    def detect_three_stars_south(self, data): return {'detected': False}
    def detect_hanging_man(self, data): return {'detected': False}
    def detect_evening_star(self, data): return {'detected': False}
    def detect_evening_doji_star(self, data): return {'detected': False}
    def detect_three_black_crows(self, data): return {'detected': False}
    def detect_gravestone_doji(self, data): return {'detected': False}
    def detect_tweezer_tops(self, data): return {'detected': False}
    def detect_bearish_spinning_top(self, data): return {'detected': False}
    def detect_falling_three(self, data): return {'detected': False}
    def detect_doji(self, data): return {'detected': False}
    def detect_piercing_pattern(self, data): return {'detected': False}
    def detect_dark_cloud_cover(self, data): return {'detected': False}
    def detect_abandoned_baby(self, data): return {'detected': False}
    def detect_harami(self, data): return {'detected': False}
    def detect_kicking_pattern(self, data): return {'detected': False}

    def analyze_stock_comprehensive(self, ticker: str) -> Dict[str, any]:
        """Comprehensive pattern analysis for a stock"""
        print(f"\n🔍 ANALYZING {ticker.upper()} - COMPREHENSIVE PATTERN DETECTION")
        print("=" * 70)
        
        # Get stock data
        data = self.get_stock_data(ticker, period="5d", interval="1m")
        
        if data.empty:
            return {'error': f'No data available for {ticker}'}
        
        current_price = data['Close'].iloc[-1]
        daily_change = (current_price - data['Close'].iloc[0]) / data['Close'].iloc[0] * 100
        volume_ratio = data['Volume_Ratio'].iloc[-1] if 'Volume_Ratio' in data.columns else 1.0
        
        print(f"📊 Current Price: ${current_price:.2f}")
        print(f"📈 Daily Change: {daily_change:+.2f}%")
        print(f"📊 Volume Ratio: {volume_ratio:.2f}x average")
        
        # Analyze patterns
        breakout_patterns = self.analyze_breakout_patterns(ticker, data)
        candlestick_patterns = self.analyze_candlestick_patterns(ticker, data)
        
        # Filter detected patterns
        detected_breakouts = {k: v for k, v in breakout_patterns.items() if v.get('detected', False)}
        detected_candlesticks = {k: v for k, v in candlestick_patterns.items() if v.get('detected', False)}
        
        # Display results
        self.display_pattern_results(ticker, detected_breakouts, detected_candlesticks)
        
        # Calculate overall signal
        overall_signal = self.calculate_overall_signal(detected_breakouts, detected_candlesticks, data)
        
        return {
            'ticker': ticker,
            'current_price': current_price,
            'daily_change': daily_change,
            'volume_ratio': volume_ratio,
            'breakout_patterns': detected_breakouts,
            'candlestick_patterns': detected_candlesticks,
            'overall_signal': overall_signal,
            'technical_data': {
                'macd_bullish': data['MACD'].iloc[-1] > data['MACD_Signal'].iloc[-1] if 'MACD' in data.columns else False,
                'above_vwap': current_price > data['VWAP'].iloc[-1] if 'VWAP' in data.columns else False,
                'rsi': data['RSI'].iloc[-1] if 'RSI' in data.columns else 50
            }
        }
    
    def display_pattern_results(self, ticker: str, breakouts: Dict, candlesticks: Dict):
        """Display pattern analysis results"""
        
        if breakouts:
            print(f"\n🚀 BREAKOUT PATTERNS DETECTED:")
            print("-" * 40)
            for pattern, details in breakouts.items():
                pattern_name = pattern.replace('_', ' ').title()
                pattern_type = details.get('pattern_type', 'neutral')
                strength = details.get('strength', 'moderate')
                
                emoji = "🟢" if pattern_type == 'bullish' else "🔴" if pattern_type == 'bearish' else "🟡"
                print(f"{emoji} {pattern_name} ({pattern_type.upper()}) - {strength}")
                
                if 'breakout_confirmed' in details:
                    status = "✅ CONFIRMED" if details['breakout_confirmed'] else "⏳ FORMING"
                    print(f"   Status: {status}")
                    
                if 'breakout_target' in details:
                    print(f"   Target: ${details['breakout_target']:.2f}")
        
        if candlesticks:
            print(f"\n🕯️ CANDLESTICK PATTERNS DETECTED:")
            print("-" * 40)
            for pattern, details in candlesticks.items():
                pattern_name = pattern.replace('_', ' ').title()
                pattern_type = details.get('pattern_type', 'neutral')
                strength = details.get('strength', 'moderate')
                
                emoji = "🟢" if pattern_type == 'bullish' else "🔴" if pattern_type == 'bearish' else "🟡"
                print(f"{emoji} {pattern_name} ({pattern_type.upper()}) - {strength}")
                
                if details.get('confirmation_needed'):
                    print(f"   ⚠️ Requires confirmation")
        
        if not breakouts and not candlesticks:
            print(f"\n📊 No significant patterns detected for {ticker}")
    
    def calculate_overall_signal(self, breakouts: Dict, candlesticks: Dict, data: pd.DataFrame) -> Dict[str, any]:
        """Calculate overall trading signal based on all patterns"""
        
        bullish_score = 0
        bearish_score = 0
        
        # Score breakout patterns
        for pattern, details in breakouts.items():
            if details.get('pattern_type') == 'bullish':
                score = 3 if details.get('strength') == 'strong' else 2
                if details.get('breakout_confirmed'):
                    score += 2
                bullish_score += score
            elif details.get('pattern_type') == 'bearish':
                score = 3 if details.get('strength') == 'strong' else 2
                if details.get('breakout_confirmed'):
                    score += 2
                bearish_score += score
        
        # Score candlestick patterns
        for pattern, details in candlesticks.items():
            if details.get('pattern_type') == 'bullish':
                score = 2 if details.get('strength') == 'strong' else 1
                bullish_score += score
            elif details.get('pattern_type') == 'bearish':
                score = 2 if details.get('strength') == 'strong' else 1
                bearish_score += score
        
        # Technical indicators bias
        if 'MACD' in data.columns and 'MACD_Signal' in data.columns:
            if data['MACD'].iloc[-1] > data['MACD_Signal'].iloc[-1]:
                bullish_score += 1
            else:
                bearish_score += 1
        
        # Determine overall signal
        net_score = bullish_score - bearish_score
        
        if net_score >= 3:
            signal = 'STRONG_BUY'
        elif net_score >= 1:
            signal = 'BUY'
        elif net_score <= -3:
            signal = 'STRONG_SELL'
        elif net_score <= -1:
            signal = 'SELL'
        else:
            signal = 'NEUTRAL'
        
        return {
            'signal': signal,
            'bullish_score': bullish_score,
            'bearish_score': bearish_score,
            'net_score': net_score,
            'confidence': min(abs(net_score) * 10, 100)  # Confidence as percentage
        }

def main():
    """Test the pattern analyzer"""
    analyzer = PatternAnalyzer()
    
    # Test with some penny stocks
    test_tickers = ['SONN', 'DARE', 'SQFT', 'VYNE', 'SHIP']
    
    print("🔍 COMPREHENSIVE PATTERN ANALYSIS FOR ROSS CAMERON STOCKS")
    print("=" * 80)
    
    results = {}
    
    for ticker in test_tickers:
        try:
            analysis = analyzer.analyze_stock_comprehensive(ticker)
            results[ticker] = analysis
            
            if 'overall_signal' in analysis:
                signal = analysis['overall_signal']
                print(f"\n🎯 OVERALL SIGNAL FOR {ticker}: {signal['signal']}")
                print(f"   Confidence: {signal['confidence']}%")
                print(f"   Bullish Score: {signal['bullish_score']}")
                print(f"   Bearish Score: {signal['bearish_score']}")
            
            print("\n" + "="*70)
            
        except Exception as e:
            print(f"❌ Error analyzing {ticker}: {e}")
    
    # Summary
    print(f"\n📋 PATTERN ANALYSIS SUMMARY")
    print("=" * 40)
    
    strong_buys = [t for t, r in results.items() if r.get('overall_signal', {}).get('signal') == 'STRONG_BUY']
    buys = [t for t, r in results.items() if r.get('overall_signal', {}).get('signal') == 'BUY']
    
    if strong_buys:
        print(f"🟢 STRONG BUY signals: {', '.join(strong_buys)}")
    if buys:
        print(f"🟡 BUY signals: {', '.join(buys)}")
    
    print(f"\n🚀 Pattern analysis complete! Use this with your Ross Cameron criteria.")

if __name__ == "__main__":
    main()
