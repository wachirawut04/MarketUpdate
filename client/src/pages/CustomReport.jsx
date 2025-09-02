import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import axios from "axios";

export default function CustomReport() {
  const tablesRef = useRef();

  const [tables, setTables] = useState([
    { name: "Table 1", symbols: [] },
    { name: "Table 2", symbols: [] },
    { name: "Table 3", symbols: [] },
    { name: "Table 4", symbols: [] },
  ]);
  const [data, setData] = useState([]);
  const [activeTable, setActiveTable] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailTime, setEmailTime] = useState("08:00");
  const [emailStatus, setEmailStatus] = useState("");

  // Load tables from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customTables");
    if (saved) setTables(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("customTables", JSON.stringify(tables));
  }, [tables]);

  // Fetch assets data
  useEffect(() => {
    async function fetchAssets() {
      const allSymbols = tables.flatMap((t) => t.symbols);
      if (allSymbols.length === 0) {
        setData([]);
        return;
      }
      try {
        const res = await fetch("http://localhost:8080/api/assets");
        const json = await res.json();
        const filtered = json.filter((item) =>
          allSymbols.some((s) => s.toLowerCase() === item.symbol.toLowerCase())
        );
        setData(filtered);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAssets();
  }, [tables]);

  const openModal = (idx) => {
    setActiveTable(idx);
    setIsModalOpen(true);
  };

  const handleAddSymbol = () => {
    const sym = newSymbol.trim();
    if (!sym) return;
    setTables((prev) => {
      const updated = [...prev];
      if (!updated[activeTable].symbols.includes(sym)) {
        updated[activeTable].symbols.push(sym);
      }
      return updated;
    });
    setNewSymbol("");
  };

  const handleRemoveSymbol = (sym) => {
    setTables((prev) => {
      const updated = [...prev];
      updated[activeTable].symbols = updated[activeTable].symbols.filter(
        (s) => s !== sym
      );
      return updated;
    });
  };

  const handleTableNameChange = (e) => {
    const name = e.target.value;
    setTables((prev) => {
      const updated = [...prev];
      updated[activeTable].name = name;
      return updated;
    });
  };

  const handleDeleteTable = (idx) => {
    setTables((prev) => prev.filter((_, i) => i !== idx));
    setIsModalOpen(false);
  };

  const addNewTable = () => {
    setTables((prev) => [...prev, { name: `Table ${prev.length + 1}`, symbols: [] }]);
  };

  // Server-side PDF export
  const exportToPDF = async () => {
    if (tables.length === 0) return;
    try {
      const res = await axios.post(
        "http://localhost:8080/api/export/pdf",
        { tables, data },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tables_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  // PNG export using html2canvas
  const exportToPNG = async () => {
    if (!tablesRef.current) return;
    try {
      const canvas = await html2canvas(tablesRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "tables_report.png";
      link.click();
    } catch (err) {
      console.error("PNG export error:", err);
    }
  };

  // Schedule daily email
  const scheduleEmail = async () => {
    if (!emailRecipient) return;
    try {
      const res = await axios.post("http://localhost:8080/api/schedule-email", {
        recipient: emailRecipient,
        time: emailTime,
        tables,
        data
      });
      setEmailStatus(res.data.message);
    } catch (err) {
      console.error(err);
      setEmailStatus("Failed to schedule email");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAFAFA", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: "8px", width: "100%", marginBottom: "16px", justifyContent: "flex-start" }}>
        <button onClick={exportToPDF} style={{ padding: "4px 12px", backgroundColor: "#2563EB", color: "#FFFFFF", borderRadius: "4px", cursor: "pointer" }}>Export PDF</button>
        <button onClick={exportToPNG} style={{ padding: "4px 12px", backgroundColor: "#4B5563", color: "#FFFFFF", borderRadius: "4px", cursor: "pointer" }}>Export PNG</button>
        <button onClick={addNewTable} style={{ padding: "4px 12px", backgroundColor: "#16A34A", color: "#FFFFFF", borderRadius: "4px", cursor: "pointer" }}>Add Table</button>
        <button onClick={() => setIsEmailModalOpen(true)} style={{ padding: "4px 12px", backgroundColor: "#F59E0B", color: "#FFFFFF", borderRadius: "4px", cursor: "pointer" }}>Schedule Email</button>
      </div>

      {/* Tables Container */}
      <div ref={tablesRef} style={{ backgroundColor: "#FFFFFF", padding: "16px", width: "210mm", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontWeight: "700", fontSize: "18px", marginBottom: "8px", textAlign: "center" }}>Market Performance Report</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {tables.map((table, idx) => (
            <div key={idx} style={{ backgroundColor: "#F9FAFB", padding: "8px", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", cursor: "pointer" }} onClick={() => openModal(idx)}>
              <h4 style={{ fontWeight: "600", fontSize: "14px", marginBottom: "8px", textAlign: "center" }}>{table.name}</h4>
              <table style={{ width: "100%", textAlign: "center", fontSize: "12px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#2563EB", color: "#FFFFFF", textTransform: "uppercase", fontSize: "10px" }}>
                    <th style={{ padding: "4px", width: "20%" }}>Symbol</th>
                    <th style={{ padding: "4px", width: "20%" }}>Close</th>
                    <th style={{ padding: "4px", width: "20%" }}>Low</th>
                    <th style={{ padding: "4px", width: "20%" }}>Change</th>
                    <th style={{ padding: "4px", width: "20%" }}>Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {table.symbols.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "8px", color: "#9CA3AF" }}>Empty</td>
                    </tr>
                  ) : (
                    table.symbols.map((sym, i) => {
                      const row = data.find(d => d.symbol.toLowerCase() === sym.toLowerCase());
                      return row ? (
                        <tr key={i} style={{ borderBottom: "1px solid #E5E7EB" }}>
                          <td style={{ padding: "4px", fontWeight: "500" }}>{row.symbol}</td>
                          <td style={{ padding: "4px" }}>{row.close}</td>
                          <td style={{ padding: "4px" }}>{row.low}</td>
                          <td style={{ padding: "4px", fontWeight: "600", color: row.change >= 0 ? "#16A34A" : "#DC2626" }}>{row.change}</td>
                          <td style={{ padding: "4px", fontWeight: "600", color: row.change >= 0 ? "#16A34A" : "#DC2626" }}>{row.change_percent != null ? `${row.change_percent}%` : "-"}</td>
                        </tr>
                      ) : null;
                    })
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Table Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontWeight: "700", fontSize: "16px", marginBottom: "12px" }}>Edit Table</h2>
            <input type="text" placeholder="Table Name" value={tables[activeTable]?.name} onChange={handleTableNameChange} style={{ width: "100%", marginBottom: "8px", padding: "4px", outline: "none" }} />
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input type="text" placeholder="Add Symbol" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} style={{ flex: 1, padding: "4px", outline: "none" }} />
              <button onClick={handleAddSymbol} style={{ padding: "4px 8px", backgroundColor: "#16A34A", color: "#FFFFFF", borderRadius: "4px", cursor: "pointer" }}>Add</button>
            </div>
            <div style={{ maxHeight: "240px", overflowY: "auto" }}>
              {tables[activeTable]?.symbols.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6B7280", fontSize: "12px" }}>No symbols</p>
              ) : (
                tables[activeTable].symbols.map((sym) => (
                  <div key={sym} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <span>{sym}</span>
                    <button onClick={() => handleRemoveSymbol(sym)} style={{ color: "#DC2626", cursor: "pointer" }}>Remove</button>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button onClick={() => handleDeleteTable(activeTable)} style={{ padding: "4px 12px", backgroundColor: "#DC2626", color: "#FFFFFF", borderRadius: "4px", cursor: "pointer" }}>Delete Table</button>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: "4px 12px", backgroundColor: "#D1D5DB", borderRadius: "4px", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontWeight: "700", fontSize: "16px", marginBottom: "12px" }}>Schedule Daily Email</h2>
            <input type="email" placeholder="Recipient Email" value={emailRecipient} onChange={(e) => setEmailRecipient(e.target.value)} style={{ width: "100%", marginBottom: "8px", padding: "4px", outline: "none" }} />
            <input type="time" value={emailTime} onChange={(e) => setEmailTime(e.target.value)} style={{ width: "100%", marginBottom: "8px", padding: "4px", outline: "none" }} />
            <button onClick={scheduleEmail} style={{ padding: "6px 12px", backgroundColor: "#2563EB", color: "#FFF", borderRadius: "4px", cursor: "pointer", width: "100%" }}>Schedule Email</button>
            {emailStatus && <p style={{ marginTop: "8px", color: "#16A34A", fontSize: "12px" }}>{emailStatus}</p>}
            <button onClick={() => setIsEmailModalOpen(false)} style={{ marginTop: "12px", padding: "4px 12px", backgroundColor: "#D1D5DB", borderRadius: "4px", cursor: "pointer", width: "100%" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
