import sqlite3
import finnhub
import yfinance as yf
from datetime import datetime
import numpy as np
import os

# --- SETUP ---
os.makedirs('data', exist_ok=True)
DB_PATH = 'data/price.db'
today = datetime.now().strftime('%Y-%m-%d')

# --- DATABASE ---
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Create a single table for all assets
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

stock_symbols = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA', 'FB', 'NFLX', 'NVDA']

for symbol in stock_symbols:
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

# --- 2. EQUITIES (yfinance) ---
equities = [
    ('S&P 500', '^GSPC'),
    ('Nasdaq', '^IXIC'),
    ('FTSE 100', '^FTSE'),
    ('DAX', '^GDAXI')
]

for name, ticker_symbol in equities:
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

    print(f"[equity] {name}: O={open_price}, H={high_price}, L={low_price}, C={close_price}, Δ={change}, Δ%={change_percent}")

    cursor.execute('''
        INSERT OR REPLACE INTO pricestable 
        (symbol, asset_class, date, open, high, low, close, change, change_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (name, 'equities', today, open_price, high_price, low_price, close_price, change, change_percent))

# --- 3. COMMODITIES (yfinance) ---
commodities = [
    ('Gold', 'GC=F'),
    ('Crude Oil', 'CL=F'),
    ('Natural Gas', 'NG=F')
]

for name, ticker_symbol in commodities:
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

    print(f"[commodities] {name}: O={open_price}, H={high_price}, L={low_price}, C={close_price}, Δ={change}, Δ%={change_percent}")

    cursor.execute('''
        INSERT OR REPLACE INTO pricestable 
        (symbol, asset_class, date, open, high, low, close, change, change_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (name, 'commodities', today, open_price, high_price, low_price, close_price, change, change_percent))

# --- 4. FOREX (yfinance) ---
forex_pairs = [
    ('EUR/USD', 'EURUSD=X'),
    ('GBP/USD', 'GBPUSD=X'),
    ('USD/JPY', 'JPY=X'),
    ('AUD/USD', 'AUDUSD=X'),
    ('USD/CAD', 'CAD=X'),
    ('USD/CHF', 'CHF=X'),
    ('NZD/USD', 'NZDUSD=X')
]

for name, yf_symbol in forex_pairs:
    ticker = yf.Ticker(yf_symbol)
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

    print(f"[forex] {name}: O={open_price}, H={high_price}, L={low_price}, C={close_price}, Δ={change}, Δ%={change_percent}")

    cursor.execute('''
        INSERT OR REPLACE INTO pricestable 
        (symbol, asset_class, date, open, high, low, close, change, change_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (name, 'forex', today, open_price, high_price, low_price, close_price, change, change_percent))

# --- FINALIZE ---
conn.commit()

# --- SUM ALL CLOSE PRICES ---
cursor.execute("SELECT SUM(close) FROM pricestable")
total_close = cursor.fetchone()[0]
print(f"\nTotal sum of all close prices: {total_close}")

cursor.execute("SELECT COUNT(*) FROM pricestable")
total_rows = cursor.fetchone()[0]
print(f"Total records in pricestable: {total_rows}")

cursor.close()
conn.close()
