import { useState, useEffect } from "react";
import Nav from "../Components/Nav";

const Home = () => {
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  // Animation trigger
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <>
      <Nav />

      <main className="flex flex-col items-center justify-center min-h-screen bg-[#323643] text-[#F7F7F7] px-4 pt-24 text-center">
        <h1
          className={`text-4xl md:text-5xl font-bold mb-4 transition-opacity duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          📊 Daily Market Summary Aggregator
        </h1>

        <p
          className={`text-lg md:text-xl max-w-2xl text-[#93DEFF] transition-opacity duration-1000 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Stay informed with real-time market insights across currencies,
          commodities, indices, and key stocks — all in one place. Our system
          collects and normalizes data from trusted public APIs to generate a
          daily, easy-to-read summary for investors, analysts, and enthusiasts.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {[
            { label: "🔍 What We Do", key: "what" },
            { label: "💡 Why Use It?", key: "why" },
            { label: "🚀 Built With", key: "built" },
          ].map(({ label, key }) => (
            <button
              key={key}
              onClick={() => setModal(key)}
              className="px-6 py-3 bg-[#93DEFF] text-[#323643] font-semibold rounded shadow-md hover:bg-[#F7F7F7] hover:scale-105 transition-all duration-300"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-[#F7F7F7] p-8 rounded-lg max-w-lg w-full text-left shadow-xl border border-[#93DEFF] animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-4 text-[#323643]">
                {modal === "what" && "🔍 What We Do"}
                {modal === "why" && "💡 Why Use It?"}
                {modal === "built" && "🚀 Built With"}
              </h2>

              <div className="text-sm text-[#606470] space-y-2">
                {modal === "what" && (
                  <ul className="list-disc list-inside space-y-2">
                    <li>Connect to multiple free and public financial APIs</li>
                    <li>
                      Aggregate live/daily data across Forex, Commodities, Indices, and Stocks
                    </li>
                    <li>Normalize formats into a unified model</li>
                    <li>Generate and deliver reports via CSV, JSON, or dashboard</li>
                  </ul>
                )}
                {modal === "why" && (
                  <ul className="list-disc list-inside space-y-2">
                    <li>Track major asset classes like S&P 500, Gold, FAANG, etc.</li>
                    <li>Identify significant price movements at a glance</li>
                    <li>Customizable watchlist and thresholds</li>
                    <li>Get daily updates via Slack or Email</li>
                  </ul>
                )}
                {modal === "built" && (
                  <ul className="list-disc list-inside space-y-2">
                    <li>Python (data collection & processing)</li>
                    <li>React + Tailwind CSS (frontend)</li>
                    <li>SQLite/PostgreSQL (data storage)</li>
                    <li>APScheduler or cron (task automation)</li>
                  </ul>
                )}
              </div>

              <button
                onClick={closeModal}
                className="mt-6 px-4 py-2 bg-[#93DEFF] text-[#323643] rounded hover:bg-[#E0F5FF] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
