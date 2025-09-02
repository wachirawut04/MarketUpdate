import sqlite3
import finnhub
import yfinance as yf
from datetime import datetime
import os

# --- SETUP ---
os.makedirs('data', exist_ok=True)
DB_PATH = 'data/price.db'
today = datetime.now().strftime('%Y-%m-%d')

# --- DATABASE ---
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS pricestable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT,
    asset_class TEXT,
    date TEXT,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    change REAL,
    change_percent REAL,
    UNIQUE(symbol, asset_class)
)
''')
conn.commit()

# --- 1. STOCKS (Finnhub) ---
FINNHUB_API_KEY = "d1rjmjhr01qk8n67e1tgd1rjmjhr01qk8n67e1u0"
finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)

# You can extend this list as needed
stock_symbols = [
    'AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA', 'FB', 'NFLX', 'NVDA',
    'BABA', 'INTC', 'AMD', 'PYPL','UBER', 'DIS', 'ADBE'
]

for symbol in stock_symbols:
    try:
        quote = finnhub_client.quote(symbol)
        open_price = quote.get('o', 0)
        high_price = quote.get('h', 0)
        low_price = quote.get('l', 0)
        close_price = quote.get('c', 0)
        change = round(close_price - open_price, 2)
        change_percent = round((change / open_price) * 100 if open_price else 0, 2)

        print(f"[stock] {symbol}: O={open_price}, H={high_price}, L={low_price}, C={close_price}, Δ={change}, Δ%={change_percent}")

        cursor.execute('''
            INSERT OR REPLACE INTO pricestable 
            (symbol, asset_class, date, open, high, low, close, change, change_percent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (symbol, 'stock', today, open_price, high_price, low_price, close_price, change, change_percent))
    except Exception as e:
        print(f"[ERROR] Failed to fetch stock {symbol}: {e}")

# --- 2. EQUITIES, 3. COMMODITIES, 4. FOREX ---
def fetch_yfinance_data(items, asset_class):
    for name, ticker_symbol in items:
        try:
            ticker = yf.Ticker(ticker_symbol)
            data = ticker.history(period="1d")
            if data.empty:
                print(f"[ERROR] No data for {name}")
                continue
            last_row = data.iloc[-1]
            open_price = round(last_row['Open'], 2)
            high_price = round(last_row['High'], 2)
            low_price = round(last_row['Low'], 2)
            close_price = round(last_row['Close'], 2)
            change = round(close_price - open_price, 2)
            change_percent = round((change / open_price) * 100 if open_price else 0, 2)

            print(f"[{asset_class}] {name}: O={open_price}, H={high_price}, L={low_price}, C={close_price}, Δ={change}, Δ%={change_percent}")

            cursor.execute('''
                INSERT OR REPLACE INTO pricestable 
                (symbol, asset_class, date, open, high, low, close, change, change_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (name, asset_class, today, open_price, high_price, low_price, close_price, change, change_percent))
        except Exception as e:
            print(f"[ERROR] Failed to fetch {asset_class} {name}: {e}")

equities = [
    ('S&P 500', '^GSPC'),
    ('Nasdaq', '^IXIC'),
    ('FTSE 100', '^FTSE'),
    ('DAX', '^GDAXI'),
    ('Nikkei 225', '^N225')
]

commodities = [
    ('Gold', 'GC=F'),
    ('Crude Oil', 'CL=F'),
    ('Natural Gas', 'NG=F'),
    ('Silver', 'SI=F'),
    ('Copper', 'HG=F')
]

forex_pairs = [
    ('EUR/USD', 'EURUSD=X'),
    ('GBP/USD', 'GBPUSD=X'),
    ('USD/JPY', 'JPY=X'),
    ('AUD/USD', 'AUDUSD=X'),
    ('USD/CAD', 'CAD=X'),
    ('USD/CHF', 'CHF=X'),
    ('NZD/USD', 'NZDUSD=X')
]

fetch_yfinance_data(equities, 'equities')
fetch_yfinance_data(commodities, 'commodities')
fetch_yfinance_data(forex_pairs, 'forex')

# --- FINALIZE ---
conn.commit()

cursor.execute("SELECT SUM(close) FROM pricestable")
total_close = cursor.fetchone()[0]
print(f"\nTotal sum of all close prices: {total_close}")

cursor.execute("SELECT COUNT(*) FROM pricestable")
total_rows = cursor.fetchone()[0]
print(f"Total records in pricestable: {total_rows}")

cursor.close()
conn.close()
