import React from "react";

export default function SymbolInput({ symbol, setSymbol }) {
  return (
    <input
      className="border p-2 mb-4 rounded w-40"
      value={symbol}
      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
      placeholder="Enter stock symbol"
    />
  );
}
