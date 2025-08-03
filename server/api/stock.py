import sqlite3
import finnhub
import requests
import numpy as np
import websocket
from datetime import datetime


finnhub_client =finnhub.Client(api_key="d1rjmjhr01qk8n67e1tgd1rjmjhr01qk8n67e1u0")


conn = sqlite3.connect('data/stock.db')
cursor = conn.cursor()

Table_schema = ('''
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

def create_table():
    cursor.execute(Table_schema)
    conn.commit()

stock_symbols = np.array([
    'AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA', 'FB', 'NFLX', 'NVDA'])


print(stock_symbols[0:6])

create_table()


for symbol in stock_symbols:
    quote = finnhub_client.quote(symbol)
    print(f'[stock] {symbol} {quote}')

    open_prices = quote.get('o', 0)
    high_prices = quote.get('h', 0)
    low_prices = quote.get('l', 0)
    close_prices = quote.get('c', 0)

    # Calculate change and change percent
    change = round(close_prices - open_prices,2)
    change_percent = round((change / open_prices) * 100 if open_prices else 0,2)
    # Date for the record
    date = datetime.now().strftime('%Y-%m-%d')
    print(f'[stock] {symbol} : open = {open_prices} high = {high_prices} low = {low_prices} close = {close_prices} change = f{change} change_percent {change_percent}' )

    # Insert data into the database
    cursor.execute('''
            INSERT INTO pricestable (
                   symbol, asset_class, date, open, high, low, close, change, change_percent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                on CONFLICT(symbol) DO UPDATE SET
                    asset_class = 'stock',
                    date = excluded.date,
                    open = excluded.open,
                    high = excluded.high,
                    low = excluded.low,
                    close = excluded.close,
                    change = excluded.change,
                    change_percent = excluded.change_percent 
                   ''', (
                    symbol,
                    'stock',
                    date,
                    open_prices,
                    high_prices,
                    low_prices,
                    close_prices,
                    change,
                    change_percent
                   ))
    
conn.commit()
cursor.close()    
conn.close()

    

