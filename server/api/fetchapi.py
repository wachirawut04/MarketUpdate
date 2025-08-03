import time 
import datetime
import pytz
import subprocess

import stock,forex,equities,commodities


def run_module_script(script_name):
    subprocess.run(['python3', script_name], check=True)


def market_open():
    #US market opens at 9:30 AM EST to 4:00 PM EST 
    eastern = pytz.timezone('US/Eastern')
    now = datetime.datetime.now(eastern)
    open_time = now.replace(hour=9, minute=30, second=0, microsecond=0)
    close_time = now.replace(hour=16, minute=0, second=0, microsecond=0)

    return now.weekday() < 5 and open_time <= now <= close_time # Weekday < 5 means Monday to Friday

def run_during_market_hours(interval_seconds=300):
    print("[INFO] Fetching data during market hours...")
    while True:
        if market_open():
            print(f"[RUNNING] {datetime.datetime.now()} Market is open. Fetching data...")
            try:
                run_module_script('stock.py')
                run_module_script('forex.py')
                run_module_script('equities.py')
                run_module_script('commodities.py')
            except Exception as e:
                print(f"[SLEEP] {datetime.datetime.now()} Market is C: {e}")
        else:
            print("[INFO] Market is closed. Waiting for market hours..")

        time.sleep(interval_seconds)
    
if __name__ == "__main__":
    run_during_market_hours()
        