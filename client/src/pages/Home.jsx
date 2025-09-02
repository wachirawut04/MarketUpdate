import { useState, useEffect } from "react";
import Modal from "../Components/Modal";

const modalContent = {
  what: {
    title: "🔍 What We Do",
    content: (
      <ul className="list-disc list-inside space-y-2">
        <li>Connect to multiple free and public financial APIs</li>
        <li>Aggregate live/daily data across Forex, Commodities, Indices, and Stocks</li>
        <li>Normalize formats into a unified model</li>
        <li>Generate and deliver reports via CSV, JSON, or dashboard</li>
      </ul>
    ),
  },
  why: {
    title: "💡 Why Use It?",
    content: (
      <ul className="list-disc list-inside space-y-2">
        <li>Track major asset classes like S&P 500, Gold, FAANG, etc.</li>
        <li>Identify significant price movements at a glance</li>
        <li>Customizable watchlist and thresholds</li>
        <li>Get daily updates via Slack or Email</li>
      </ul>
    ),
  },
  built: {
    title: "🚀 Built With",
    content: (
      <ul className="list-disc list-inside space-y-2">
        <li>Python (data collection & processing)</li>
        <li>React + Tailwind CSS (frontend)</li>
        <li>SQLite/PostgreSQL (data storage)</li>
        <li>APScheduler or cron (task automation)</li>
      </ul>
    ),
  },
};

const Home = () => {
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <main
        className="flex-grow flex items-center justify-center px-4 text-center pt-16 min-h-[calc(100vh-3rem)]"
        style={{ transform: "translateY(-1.5rem)" }} // หรือใช้ Tailwind class -translate-y-6
      >
        <div className="w-full max-w-2xl mx-auto">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-6 transition-opacity duration-1000 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            Daily Market Summary Aggregator
          </h1>

          <p
            className={`text-lg md:text-xl text-[#1F2937] transition-opacity duration-1000 delay-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            Get real-time insights on currencies, commodities, indices, and stocks — all in one.
            We simplify public market data into daily summaries for investors and analysts.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {["what", "why", "built"].map((key) => (
              <button
                key={key}
                onClick={() => setModal(key)}
                className="px-6 py-3 bg-[#0077C0] text-white font-semibold rounded shadow-md hover:bg-[#2563EB] hover:scale-105 transition-transform duration-300"
              >
                {modalContent[key].title}
              </button>
            ))}
          </div>
        </div>
      </main>

      {modal && modalContent[modal] && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title={modalContent[modal].title}
          content={modalContent[modal].content}
        />
      )}
    </div>
  );
};

export default Home;
