// SearchBar.jsx
import { useState, useEffect, useRef } from "react";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/assets/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 300); // debounce
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (item) => {
    setQuery("");
    setResults([]);
    onSelect(item); // call parent (Navbar) to handle asset_class change or table jump
  };

  // close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-60 md:w-72" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search symbol..."
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      {results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto text-sm">
          {results.map((item) => (
            <li
              key={item.id || item.symbol}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              {item.symbol} - {item.asset_name} ({item.asset_class})
            </li>
          ))}
        </ul>
      )}

      {loading && (
        <div className="absolute right-2 top-2 text-gray-400 text-sm">Loading...</div>
      )}
    </div>
  );
}
