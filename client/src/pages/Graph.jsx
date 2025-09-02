import React, { useState, useEffect } from "react";
import AssetChart from "../Components/AssetChart";

const INTERVALS = ["1d", "5d", "1m", "3m", "6m", "ytd"];

export default function Graph() {
  const [symbol, setSymbol] = useState("AAPL");
  const [interval, setInterval] = useState("1d");
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);

    fetch(`http://localhost:8080/api/stock/${symbol}?interval=${interval}`)
      .then((res) => {
        if (!res.ok) throw new Error("No data");
        return res.json();
      })
      .then((data) => {
        const formatted = data.map((d) => ({
          date: new Date(d.date).toISOString(),
          open: Math.round(d.open * 100) / 100,
          high: Math.round(d.high * 100) / 100,
          low: Math.round(d.low * 100) / 100,
          close: Math.round(d.close * 100) / 100
        
        }));
        setHistoricalData(formatted);
      })
      .catch(() => setHistoricalData([]))
      .finally(() => setLoading(false));
  }, [symbol, interval]);

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">
  Stock Graph: <span className="text-blue-600">{symbol}</span>
</h1>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          className="border border-gray-300 p-2 rounded-md w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol e.g. AAPL"
        />

        {INTERVALS.map((intv) => (
          <button
            key={intv}
            className={`px-3 py-1 rounded-md transition-colors duration-200 ${
              interval === intv
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setInterval(intv)}
          >
            {intv.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <div className="text-gray-500">Loading historical data...</div>}

      {!loading && historicalData.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow">
          <AssetChart data={historicalData} interval={interval} />
        </div>
      )}

      {!loading && historicalData.length === 0 && (
        <div className="text-red-500">No historical data found</div>
      )}
    </div>
  );
}
