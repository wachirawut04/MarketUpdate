import sqlite3
import yfinance as yf
from datetime import datetime
import numpy as np
import os

# Ensure directory exists
os.makedirs('data', exist_ok=True)

conn = sqlite3.connect('data/commodities.db')
cursor = conn.cursor()

# Create table WITHOUT ticker column
cursor.execute('''
    CREATE TABLE IF NOT EXISTS pricestable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT UNIQUE,
        asset_class TEXT,
        date TEXT,
        open REAL,
        high REAL,
        low REAL,
        close REAL,
        change REAL,
        change_percent REAL              
    )
''')
conn.commit()

commodities = np.array([
    ('Gold', 'GC=F'),
    ('Crude Oil', 'CL=F'),
    ('Natural Gas', 'NG=F'),
])

for name, ticker_symbol in commodities:
    ticker = yf.Ticker(ticker_symbol)
    data = ticker.history(period="1d")

    if data.empty:
        print(f"[ERROR] No data for {name} ({ticker_symbol})")
        continue

    last_row = data.iloc[-1]
    open_price = round(last_row['Open'], 2)
    high_price = round(last_row['High'], 2)
    low_price = round(last_row['Low'], 2)
    close_price = round(last_row['Close'], 2)

    change = round(close_price - open_price, 2)
    change_percent = round((change / open_price) * 100 if open_price else 0, 2)
    date = datetime.now().strftime('%Y-%m-%d')

    print(f"[commodities] {name} ({ticker_symbol}): Open={open_price:.2f}, High={high_price:.2f}, Low={low_price:.2f}, Close={close_price:.2f}, Change={change:.2f}, Change%={change_percent:.2f}%")

    cursor.execute('''
        INSERT INTO pricestable (symbol, asset_class, date, open, high, low, close, change, change_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(symbol) DO UPDATE SET
            asset_class=excluded.asset_class,
            date=excluded.date,
            open=excluded.open,
            high=excluded.high,
            low=excluded.low,
            close=excluded.close,
            change=excluded.change,
            change_percent=excluded.change_percent
    ''', (name, 'commodities', date, open_price, high_price, low_price, close_price, change, change_percent))

conn.commit()
cursor.close()
conn.close()
