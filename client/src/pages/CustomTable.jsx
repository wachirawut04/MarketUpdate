import { useState, useEffect } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";

export default function CustomTable() {
  const [symbols, setSymbols] = useState(() => {
    // Load saved symbols from localStorage
    const saved = localStorage.getItem("customSymbols");
    return saved ? JSON.parse(saved) : [];
  });
  const [newSymbol, setNewSymbol] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Save symbols to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem("customSymbols", JSON.stringify(symbols));
  }, [symbols]);

  // Fetch data from API
  useEffect(() => {
    async function fetchAssets() {
      if (symbols.length === 0) {
        setData([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/api/assets");
        const json = await res.json();

        // Only include symbols that exist in database
        const filtered = json.filter((item) =>
          symbols.some((s) => s.toLowerCase() === item.symbol.toLowerCase())
        );

        setData(filtered);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, [symbols]);

  const handleAddSymbol = () => {
    const symbolTrimmed = newSymbol.trim();
    if (!symbolTrimmed) return;
    // Check if symbol already added
    if (!symbols.includes(symbolTrimmed)) {
      setSymbols([...symbols, symbolTrimmed]);
    }
    setNewSymbol("");
  };

  const handleRemoveSymbol = (symbol) => {
    setSymbols(symbols.filter((s) => s !== symbol));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Add Symbol */}
        <div className="flex items-center mb-4 space-x-2 max-w-xs">
          <input
            type="text"
            placeholder="Enter symbol"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0077C0]"
          />
          <button
            onClick={handleAddSymbol}
            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-md bg-white">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#0077C0] text-white">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Symbol</th>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Asset Class</th>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Open</th>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">High</th>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Low</th>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Close</th>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Change</th>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Change %</th>
                  <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Remove</th>
                </tr>
              </thead>
              <tbody>
                {symbols.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      No symbols added
                    </td>
                  </tr>
                ) : (
                  symbols.map((symbol) => {
                    const item =
                      data.find((d) => d.symbol.toLowerCase() === symbol.toLowerCase()) || null;

                    if (!item) return null; // Don't render if symbol not in database

                    const isPositive = item.change >= 0;
                    return (
                      <tr key={symbol} className="even:bg-gray-100">
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.symbol}</td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.asset_class}</td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.open}</td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.high}</td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.low}</td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.close}</td>
                        <td
                          className={`px-3 sm:px-4 py-2 whitespace-nowrap font-semibold ${
                            isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.change}
                        </td>
                        <td
                          className={`px-3 sm:px-4 py-2 whitespace-nowrap font-semibold ${
                            isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.change_percent != null ? `${item.change_percent}%` : "-"}
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                          <button
                            onClick={() => handleRemoveSymbol(symbol)}
                            className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
