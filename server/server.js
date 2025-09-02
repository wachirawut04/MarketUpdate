const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const yf = require("yahoo-finance2").default;
const { Parser } = require("json2csv");

const app = express();
const PORT = 8080;

app.use(cors({ origin: "http://localhost:5173" }));

// Path to DB
const DB_PATH = path.resolve(__dirname, "api/data/price.db");

// Open SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Failed to open database:", err.message);
  } else {
    console.log("Connected to SQLite database:", DB_PATH);
  }
});

// ========== API: Get assets ==========
app.get("/api/assets", (req, res) => {
  const assetClass = req.query.assetClass?.toLowerCase();
  let sql = "SELECT * FROM pricestable";
  const params = [];

  if (assetClass) {
    sql += " WHERE LOWER(asset_class) = ?";
    params.push(assetClass);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

// ========== API: Sum ==========
app.get("/api/assets/sum", (req, res) => {
  const assetClass = req.query.assetClass?.toLowerCase();
  let sql = "SELECT SUM(close) AS total_close, COUNT(*) AS total_count FROM pricestable";
  const params = [];

  if (assetClass) {
    sql += " WHERE LOWER(asset_class) = ?";
    params.push(assetClass);
  }

  db.get(sql, params, (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(row);
  });
});

// ========== API: Search ==========
app.get("/api/assets/search", (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.status(400).json({ error: "Missing search query" });

  const sql = `
    SELECT *
    FROM pricestable
    WHERE asset_name LIKE ? OR asset_symbol LIKE ?
    LIMIT 10
  `;

  db.all(sql, [`%${query}%`, `%${query}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

// ========== API: Stock historical ==========
app.get("/api/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { interval } = req.query;

  const intervalMap = {
    "1d": "1d",
    "5d": "1d",
    "1m": "1d",
    "3m": "1d",
    "6m": "1d",
    "ytd": "1d",
  };

  const now = new Date();
  let period1;

  switch (interval) {
    case "1d":
      period1 = new Date();
      period1.setDate(now.getDate() - 1);
      break;
    case "5d":
      period1 = new Date();
      period1.setDate(now.getDate() - 5);
      break;
    case "1m":
      period1 = new Date();
      period1.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      period1 = new Date();
      period1.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      period1 = new Date();
      period1.setMonth(now.getMonth() - 6);
      break;
    case "ytd":
      period1 = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      period1 = new Date();
      period1.setDate(now.getDate() - 1);
  }

  try {
    const result = await yf.historical(symbol, {
      period1: period1,
      period2: now,
      interval: intervalMap[interval] || "1d",
    });

    const formatted = result.map((d) => ({
      date: d.date,
      open: Number(d.open.toFixed(2)),
      high: Number(d.high.toFixed(2)),
      low: Number(d.low.toFixed(2)),
      close: Number(d.close.toFixed(2)),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== API: Export JSON ==========
app.get("/api/export/json", (req, res) => {
  const symbol = req.query.symbol?.trim();
  const assetClass = req.query.assetClass?.toLowerCase();

  let sql = "SELECT * FROM pricestable WHERE 1=1";
  const params = [];

  if (symbol) {
    sql += " AND symbol = ?"; // <-- use 'symbol' column
    params.push(symbol);
  }
  if (assetClass) {
    sql += " AND LOWER(asset_class) = ?";
    params.push(assetClass);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });

    const filename = symbol
      ? `prices_${symbol.replace(/\W/g, "_")}.json`
      : assetClass
      ? `prices_${assetClass}.json`
      : "prices.json";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/json");
    res.json(rows);
  });
});

// ========== API: Export CSV ==========
app.get("/api/export/csv", (req, res) => {
  const symbol = req.query.symbol ? decodeURIComponent(req.query.symbol.trim()) : null;
  const assetClass = req.query.assetClass?.toLowerCase();

  let sql = "SELECT * FROM pricestable WHERE 1=1";
  const params = [];

  if (symbol) {
    sql += " AND symbol = ?"; // <-- use 'symbol' column
    params.push(symbol);
  }
  if (assetClass) {
    sql += " AND LOWER(asset_class) = ?";
    params.push(assetClass);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });

    try {
      const parser = new Parser();
      const csv = parser.parse(rows);

      const filename = symbol
        ? `prices_${symbol.replace(/\W/g, "_")}.csv`
        : assetClass
        ? `prices_${assetClass}.csv`
        : "prices.csv";

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (e) {
      res.status(500).json({ error: "Failed to convert to CSV" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
