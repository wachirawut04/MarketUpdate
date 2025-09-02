import { useState, useEffect, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useSearchParams } from "react-router-dom";

const assetClasses = [
  { id: 1, name: "Stock", value: "stock" },
  { id: 2, name: "Forex", value: "forex" },
  { id: 3, name: "Commodities", value: "commodities" },
  { id: 4, name: "Equities", value: "equities" },
];

export default function Market() {
  const [searchParams] = useSearchParams();
  const categoryFromURL = searchParams.get("category");
  const symbolFromURL = searchParams.get("symbol");

  const [selectedClass, setSelectedClass] = useState(
    assetClasses.find((a) => a.value === categoryFromURL?.toLowerCase()) ||
      assetClasses[0]
  );
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchAssets() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/api/assets");
        const json = await res.json();

        const filtered = json.filter(
          (item) => item.asset_class.toLowerCase() === selectedClass.value
        );

        const finalData = symbolFromURL
          ? filtered.filter(
              (item) => item.symbol.toLowerCase() === symbolFromURL.toLowerCase()
            )
          : filtered;

        setData(finalData);
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, [selectedClass, symbolFromURL]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Dropdown */}
        <Listbox value={selectedClass} onChange={setSelectedClass}>
          <div className="relative w-full max-w-xs mb-6">
            <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-[#0077C0] focus:border-[#0077C0]">
              <span className="block truncate">{selectedClass.name}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
                {assetClasses.map((asset) => (
                  <Listbox.Option
                    key={asset.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                        active ? "bg-[#0077C0] text-white" : "text-gray-900"
                      }`
                    }
                    value={asset}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {asset.name}
                        </span>
                        {selected && (
                          <span
                            className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                              active ? "text-white" : "text-[#0077C0]"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {/* Table */}
        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto shadow-md rounded-md">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#0077C0] text-white">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Symbol</th>
                    <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Open</th>
                    <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">High</th>
                    <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Low</th>
                    <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Close</th>
                    <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Change</th>
                    <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => {
                      const isPositive = item.change >= 0;
                      return (
                        <tr key={item.symbol || item.id} className="even:bg-gray-100">
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.symbol}</td>
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.open}</td>
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.high}</td>
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.low}</td>
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">{item.close}</td>
                          <td className={`px-3 sm:px-4 py-2 whitespace-nowrap font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{item.change}</td>
                          <td className={`px-3 sm:px-4 py-2 whitespace-nowrap font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{item.change_percent != null ? `${item.change_percent}%` : ""}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls - Single number with arrows */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-4">
                <button
                  className={`px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  &larr;
                </button>

                <span className="px-4 py-1 font-semibold">
                  {currentPage} / {totalPages}
                </span>

                <button
                  className={`px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
