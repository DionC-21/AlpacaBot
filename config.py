import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Alpaca credentials
    ALPACA_API_KEY = os.getenv("APCA_API_KEY_ID")
    ALPACA_SECRET_KEY = os.getenv("APCA_API_SECRET_KEY")
    ALPACA_BASE_URL = os.getenv("APCA_API_BASE_URL")
    
    # Polygon.io key
    POLYGON_API_KEY = os.getenv("POLYGON_API_KEY")
    FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
    
    # Alpha Vantage API key for news sentiment
    ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

# Legacy support - keep these for backward compatibility
API_KEY = Config.ALPACA_API_KEY
SECRET_KEY = Config.ALPACA_SECRET_KEY
BASE_URL = Config.ALPACA_BASE_URL
POLYGON_API_KEY = Config.POLYGON_API_KEY
FINNHUB_API_KEY = Config.FINNHUB_API_KEY
ALPHA_VANTAGE_API_KEY = Config.ALPHA_VANTAGE_API_KEY