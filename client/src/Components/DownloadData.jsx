import React, { useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const ASSET_CLASSES = [
  { label: "All classes", value: "" },
  { label: "Stock", value: "stock" },
  { label: "Equities", value: "equities" },
  { label: "Commodities", value: "commodities" },
  { label: "Forex", value: "forex" },
];

export default function DownloadData({ defaultSymbol = "" }) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [assetClass, setAssetClass] = useState(ASSET_CLASSES[0]);
  const [busy, setBusy] = useState(false);

  const base = "http://localhost:8080";

  const buildUrl = (fmt) => {
    const params = new URLSearchParams();
    if (symbol) params.set("symbol", symbol.trim().toUpperCase());
    if (assetClass.value) params.set("assetClass", assetClass.value);
    return `${base}/api/export/${fmt}?${params.toString()}`;
  };

  const triggerDownload = async (fmt) => {
    try {
      setBusy(true);
      const url = buildUrl(fmt);
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();

      const fileName = `prices${symbol ? "_" + symbol.toUpperCase() : ""}.${fmt === "json" ? "json" : "csv"}`;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
      alert("Download failed. Check server logs.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-end gap-3 bg-white/70 backdrop-blur rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex-1">
        <label className="block text-sm text-gray-600 mb-1">Symbol</label>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="e.g. AAPL (optional)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="w-full md:w-60">
        <label className="block text-sm text-gray-600 mb-1">Asset class</label>
        <Listbox value={assetClass} onChange={setAssetClass}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="block truncate">{assetClass.label}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {ASSET_CLASSES.map((opt) => (
                  <Listbox.Option
                    key={opt.value || "all"}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                      }`
                    }
                    value={opt}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          {opt.label}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => triggerDownload("json")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          JSON
        </button>
        <button
          disabled={busy}
          onClick={() => triggerDownload("csv")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          CSV
        </button>
      </div>
    </div>
  );
}
