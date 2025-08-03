import sqlite3
import requests
import numpy as np
from datetime import datetime

twelve_data_api_key = "744ddbd8db9946189404ace30d242387"

# Connect to SQLite
conn = sqlite3.connect('data/forex.db')
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

# Forex pairs (with slash)
forex_pairs = np.array([
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'])

print(forex_pairs[0:6])

# Process each pair
for pair in forex_pairs:
    symbol_for_api = pair.replace("/", "/")  # e.g. EURUSD

    url = f"https://api.twelvedata.com/quote?symbol={symbol_for_api}&apikey={twelve_data_api_key}"
    response = requests.get(url)
    data = response.json()

    if "code" in data and data["code"] == 404:
        print(f"[ERROR] API returned invalid data for {pair}: {data}")
        continue

    try:
        open_price = round(float(data.get('open', 0)), 2)
        high_price = round(float(data.get('high', 0)), 2)
        low_price = round(float(data.get('low', 0)), 2)
        close_price = round(float(data.get('close', 0)), 2)

        change = round(close_price - open_price, 2)
        change_percent = round((change / open_price) * 100 if open_price else 0, 2)
        date = datetime.now().strftime('%Y-%m-%d')

        print(f'[forex] {pair} : open = {open_price} high = {high_price} low = {low_price} close = {close_price} change = {change} change_percent {change_percent}')

        cursor.execute('''
            INSERT OR REPLACE INTO pricestable (symbol, asset_class, date, open, high, low, close, change, change_percent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(symbol) DO UPDATE SET
                asset_class = excluded.asset_class,
                date = excluded.date,
                open = excluded.open,   
                high = excluded.high,
                low = excluded.low,
                close = excluded.close,
                change = excluded.change, 
                change_percent = excluded.change_percent
        ''', (
            pair,  
            'forex',
            date,
            open_price,
            high_price,
            low_price,
            close_price,
            change,
            change_percent
        ))
    except Exception as e:
        print(f"[ERROR] Failed to process {pair}: {e}")

conn.commit()
cursor.close()
conn.close()
