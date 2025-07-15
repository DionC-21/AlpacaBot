#!/usr/bin/env python3
"""
ROSS CAMERON TRADING WITH ADVANCED PATTERN ANALYSIS
Integrates comprehensive pattern analysis with Ross Cameron momentum criteria
"""

from pattern_analyzer import PatternAnalyzer
import yfinance as yf
from datetime import datetime, timedelta
import logging

class RossCameronPatternTrader:
    def __init__(self):
        self.pattern_analyzer = PatternAnalyzer()
        self.logger = logging.getLogger(__name__)
        
        # Ross Cameron criteria
        self.min_price = 0.50
        self.max_price = 20.00
        self.min_change_percent = 15.0
        self.min_volume = 100000
        
        # Pattern analysis weights
        self.pattern_weights = {
            'STRONG_BUY': 5,
            'BUY': 3,
            'NEUTRAL': 0,
            'SELL': -3,
            'STRONG_SELL': -5
        }
    
    def get_ross_cameron_candidates(self, tickers_list):
        """Screen stocks using Ross Cameron criteria"""
        candidates = []
        
        print("🔍 SCREENING FOR ROSS CAMERON CANDIDATES")
        print("=" * 50)
        
        for ticker in tickers_list:
            try:
                stock = yf.Ticker(ticker)
                data = stock.history(period="2d", interval="1d", prepost=True)
                
                if len(data) < 2:
                    continue
                    
                current_price = data['Close'].iloc[-1]
                prev_close = data['Close'].iloc[-2]
                volume = data['Volume'].iloc[-1]
                change_percent = ((current_price - prev_close) / prev_close) * 100
                
                # Apply Ross Cameron filters
                price_ok = self.min_price <= current_price <= self.max_price
                change_ok = change_percent >= self.min_change_percent
                volume_ok = volume >= self.min_volume
                
                if price_ok and change_ok and volume_ok:
                    candidates.append({
                        'ticker': ticker,
                        'price': current_price,
                        'change_percent': change_percent,
                        'volume': volume
                    })
                    
                    print(f"✅ {ticker}: ${current_price:.2f} (+{change_percent:.1f}%) Vol: {volume:,}")
                
            except Exception as e:
                self.logger.error(f"Error screening {ticker}: {e}")
                
        return candidates
    
    def analyze_candidates_with_patterns(self, candidates):
        """Analyze Ross Cameron candidates with comprehensive pattern analysis"""
        
        if not candidates:
            print("❌ No Ross Cameron candidates found")
            return []
            
        print(f"\n🎯 ANALYZING {len(candidates)} CANDIDATES WITH PATTERN ANALYSIS")
        print("=" * 70)
        
        enhanced_analysis = []
        
        for candidate in candidates:
            ticker = candidate['ticker']
            
            try:
                # Get comprehensive pattern analysis
                pattern_analysis = self.pattern_analyzer.analyze_stock_comprehensive(ticker)
                
                # Combine Ross Cameron data with pattern analysis
                if 'overall_signal' in pattern_analysis:
                    signal_data = pattern_analysis['overall_signal']
                    pattern_score = self.pattern_weights.get(signal_data['signal'], 0)
                    
                    # Calculate final trading score
                    ross_score = self.calculate_ross_score(candidate)
                    final_score = ross_score + pattern_score
                    
                    enhanced_candidate = {
                        **candidate,
                        'pattern_signal': signal_data['signal'],
                        'pattern_confidence': signal_data['confidence'],
                        'pattern_score': pattern_score,
                        'ross_score': ross_score,
                        'final_score': final_score,
                        'breakout_patterns': len([p for p in pattern_analysis.get('breakout_patterns', {}).values() if p.get('detected')]),
                        'candlestick_patterns': len([p for p in pattern_analysis.get('candlestick_patterns', {}).values() if p.get('detected')]),
                        'technical_data': pattern_analysis.get('technical_data', {}),
                        'recommendation': self.get_trading_recommendation(final_score, signal_data)
                    }
                    
                    enhanced_analysis.append(enhanced_candidate)
                    
                    # Display analysis
                    self.display_candidate_analysis(enhanced_candidate)
                    
            except Exception as e:
                self.logger.error(f"Error analyzing {ticker}: {e}")
                
        return enhanced_analysis
    
    def calculate_ross_score(self, candidate):
        """Calculate Ross Cameron momentum score"""
        score = 0
        
        # Higher change percentage = higher score
        change_bonus = min(candidate['change_percent'] - 15, 50) / 10  # Max 5 points
        score += change_bonus
        
        # Volume bonus
        if candidate['volume'] > 500000:
            score += 2
        elif candidate['volume'] > 200000:
            score += 1
            
        # Price range bonus (sweet spot $1-$10)
        if 1 <= candidate['price'] <= 10:
            score += 1
        elif candidate['price'] > 15:
            score -= 1  # Higher price stocks are riskier
            
        return score
    
    def get_trading_recommendation(self, final_score, signal_data):
        """Get final trading recommendation"""
        if final_score >= 8:
            return "STRONG BUY - Execute immediately"
        elif final_score >= 5:
            return "BUY - Good opportunity"
        elif final_score >= 2:
            return "WEAK BUY - Consider with caution"
        elif final_score <= -5:
            return "AVOID - Strong bearish signals"
        elif final_score <= -2:
            return "WAIT - Mixed signals"
        else:
            return "NEUTRAL - No clear direction"
    
    def display_candidate_analysis(self, candidate):
        """Display detailed analysis for a candidate"""
        ticker = candidate['ticker']
        
        print(f"\n📊 {ticker.upper()} - DETAILED ANALYSIS")
        print("-" * 40)
        print(f"💰 Price: ${candidate['price']:.2f} (+{candidate['change_percent']:.1f}%)")
        print(f"📊 Volume: {candidate['volume']:,}")
        print(f"🎯 Pattern Signal: {candidate['pattern_signal']} ({candidate['pattern_confidence']}%)")
        print(f"🔍 Patterns Found: {candidate['breakout_patterns']} breakout, {candidate['candlestick_patterns']} candlestick")
        
        # Technical status
        tech = candidate['technical_data']
        macd_status = "✅ Bullish" if tech.get('macd_bullish') else "❌ Bearish"
        vwap_status = "✅ Above" if tech.get('above_vwap') else "❌ Below"
        
        print(f"🔧 Technical: MACD {macd_status}, VWAP {vwap_status}, RSI {tech.get('rsi', 50):.1f}")
        print(f"📈 Final Score: {candidate['final_score']:.1f}")
        print(f"🎯 Recommendation: {candidate['recommendation']}")
    
    def get_top_trading_opportunities(self, enhanced_analysis, top_n=3):
        """Get top trading opportunities ranked by final score"""
        
        # Sort by final score (highest first)
        sorted_candidates = sorted(enhanced_analysis, key=lambda x: x['final_score'], reverse=True)
        top_opportunities = sorted_candidates[:top_n]
        
        print(f"\n🏆 TOP {top_n} TRADING OPPORTUNITIES")
        print("=" * 50)
        
        for i, candidate in enumerate(top_opportunities, 1):
            ticker = candidate['ticker']
            score = candidate['final_score']
            recommendation = candidate['recommendation']
            
            if score >= 5:
                emoji = "🟢"
            elif score >= 2:
                emoji = "🟡"
            else:
                emoji = "🔴"
                
            print(f"{emoji} #{i}. {ticker} - Score: {score:.1f}")
            print(f"    ${candidate['price']:.2f} (+{candidate['change_percent']:.1f}%)")
            print(f"    {recommendation}")
            print(f"    Pattern: {candidate['pattern_signal']} ({candidate['pattern_confidence']}%)")
            
            # Technical confluence check
            tech = candidate['technical_data']
            if tech.get('macd_bullish') and tech.get('above_vwap'):
                print(f"    ✅ MACD + VWAP alignment confirmed")
            elif not tech.get('macd_bullish'):
                print(f"    ⚠️  MACD bearish - caution required")
            
            print()
        
        return top_opportunities

def main():
    """Test the integrated Ross Cameron + Pattern analysis system"""
    
    # Initialize the trader
    trader = RossCameronPatternTrader()
    
    # Sample penny stocks to analyze (in real use, get from screener)
    test_tickers = [
        'SONN', 'DARE', 'VYNE', 'SHIP', 'BKKT', 'PPSI', 'CRBP', 'ABUS',
        'TOPS', 'GNUS', 'SNDL', 'EXPR', 'CLOV', 'WISH', 'BBIG', 'SPRT'
    ]
    
    print("🤖 ROSS CAMERON TRADING WITH ADVANCED PATTERN ANALYSIS")
    print("=" * 80)
    print("Combining momentum criteria with technical pattern recognition")
    
    # Step 1: Screen for Ross Cameron candidates
    candidates = trader.get_ross_cameron_candidates(test_tickers)
    
    # Step 2: Analyze candidates with patterns
    enhanced_analysis = trader.analyze_candidates_with_patterns(candidates)
    
    # Step 3: Get top opportunities
    top_opportunities = trader.get_top_trading_opportunities(enhanced_analysis)
    
    # Final recommendation
    print(f"\n🎯 FINAL TRADING RECOMMENDATION")
    print("=" * 40)
    
    if top_opportunities:
        best_pick = top_opportunities[0]
        
        if best_pick['final_score'] >= 8:
            print(f"🟢 EXECUTE TRADE: {best_pick['ticker']}")
            print(f"   Strong confluence of momentum + patterns")
            print(f"   Entry: ${best_pick['price']:.2f}")
            print(f"   Confidence: Very High")
            
        elif best_pick['final_score'] >= 5:
            print(f"🟡 CONSIDER TRADE: {best_pick['ticker']}")
            print(f"   Good setup but monitor closely")
            print(f"   Entry: ${best_pick['price']:.2f}")
            print(f"   Confidence: Moderate")
            
        else:
            print(f"🔴 NO CLEAR TRADES TODAY")
            print(f"   Wait for better setups")
            print(f"   Best candidate: {best_pick['ticker']} (Score: {best_pick['final_score']:.1f})")
    else:
        print(f"❌ NO ROSS CAMERON CANDIDATES FOUND")
        print(f"   No stocks meeting momentum criteria today")
    
    print(f"\n🚀 Analysis complete! Combine this with your risk management.")

if __name__ == "__main__":
    main()
