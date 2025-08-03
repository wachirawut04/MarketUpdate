import sqlite3
import yfinance as yf
from datetime import datetime
import os
import numpy as np

# Ensure data directory
os.makedirs('data', exist_ok=True)

# Connect to SQLite
conn = sqlite3.connect('data/equities.db')
cursor = conn.cursor()

# Create table
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

# Define Equity Indices
equities = np.array([
    ('S&P 500', '^GSPC'),
    ('Nasdaq', '^IXIC'),
    ('FTSE 100', '^FTSE'),
    ('DAX', '^GDAXI'),
])

# Fetch and insert/update
for name, ticker_symbol in equities:
    ticker = yf.Ticker(ticker_symbol)
    data = ticker.history(period="1d")

    if data.empty:
        print(f"[ERROR] No data for {name} ({ticker_symbol})")
        continue

    last_row = data.iloc[-1]
    open_price = round(last_row['Open'], 3)
    high_price = round(last_row['High'], 3)
    low_price = round(last_row['Low'], 3)
    close_price = round(last_row['Close'], 3)

    change = round(close_price - open_price, 3)
    change_percent = round((change / open_price) * 100 if open_price else 0, 3)
    date = datetime.now().strftime('%Y-%m-%d')

    print(f"[equity] {name} ({ticker_symbol}): Open={open_price:.2f}, High={high_price:.2f}, Low={low_price:.2f}, Close={close_price:.2f}, Change={change:.2f}, Change%={change_percent:.2f}%")

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
    ''', (name, 'equities', date, open_price, high_price, low_price, close_price, change, change_percent))

# Finalize
conn.commit()
cursor.close()
conn.close()
