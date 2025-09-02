const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const yf = require("yahoo-finance2").default;
const { Parser } = require("json2csv");
const bcrypt = require("bcryptjs");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();
const PORT = 8080;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ------------------- Price DB -------------------
const PRICE_DB_PATH = path.resolve(__dirname, "api/data/price.db");
const priceDb = new sqlite3.Database(PRICE_DB_PATH, (err) => {
  if (err) console.error("Price DB error:", err.message);
  else console.log("Connected to price DB:", PRICE_DB_PATH);
});

// ------------------- Users DB -------------------
const USERS_DB_PATH = path.resolve(__dirname, "api/data/users.db");
const userDb = new sqlite3.Database(USERS_DB_PATH, (err) => {
  if (err) console.error("Users DB error:", err.message);
  else console.log("Connected to users DB:", USERS_DB_PATH);
});

// Create users table if not exists
userDb.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

// ------------------- Assets APIs -------------------
app.get("/api/assets", (req, res) => {
  const assetClass = req.query.assetClass?.toLowerCase();
  let sql = "SELECT * FROM pricestable";
  const params = [];

  if (assetClass) {
    sql += " WHERE LOWER(asset_class) = ?";
    params.push(assetClass);
  }

  priceDb.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

app.get("/api/assets/sum", (req, res) => {
  const assetClass = req.query.assetClass?.toLowerCase();
  let sql = "SELECT SUM(close) AS total_close, COUNT(*) AS total_count FROM pricestable";
  const params = [];

  if (assetClass) {
    sql += " WHERE LOWER(asset_class) = ?";
    params.push(assetClass);
  }

  priceDb.get(sql, params, (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(row);
  });
});

app.get("/api/assets/search", (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.status(400).json({ error: "Missing search query" });

  const sql = `SELECT * FROM pricestable WHERE symbol LIKE ? LIMIT 10`;

  priceDb.all(sql, [`%${query}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

// ------------------- Stock Historical -------------------
app.get("/api/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { interval } = req.query;

  const intervalMap = { "1d": "1d", "5d": "1d", "1m": "1d", "3m": "1d", "6m": "1d", "ytd": "1d" };
  const now = new Date();
  let period1;

  switch (interval) {
    case "1d": period1 = new Date(); period1.setDate(now.getDate() - 1); break;
    case "5d": period1 = new Date(); period1.setDate(now.getDate() - 5); break;
    case "1m": period1 = new Date(); period1.setMonth(now.getMonth() - 1); break;
    case "3m": period1 = new Date(); period1.setMonth(now.getMonth() - 3); break;
    case "6m": period1 = new Date(); period1.setMonth(now.getMonth() - 6); break;
    case "ytd": period1 = new Date(now.getFullYear(), 0, 1); break;
    default: period1 = new Date(); period1.setDate(now.getDate() - 1);
  }

  try {
    const result = await yf.historical(symbol, { period1, period2: now, interval: intervalMap[interval] || "1d" });
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

// ------------------- Export JSON -------------------
app.get("/api/export/json", (req, res) => {
  const symbol = req.query.symbol?.trim();
  const assetClass = req.query.assetClass?.toLowerCase();
  let sql = "SELECT * FROM pricestable WHERE 1=1";
  const params = [];

  if (symbol) { sql += " AND symbol = ?"; params.push(symbol); }
  if (assetClass) { sql += " AND LOWER(asset_class) = ?"; params.push(assetClass); }

  priceDb.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });
    const filename = symbol ? `prices_${symbol.replace(/\W/g, "_")}.json` : assetClass ? `prices_${assetClass}.json` : "prices.json";
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/json");
    res.json(rows);
  });
});

// ------------------- Export CSV -------------------
app.get("/api/export/csv", (req, res) => {
  const symbol = req.query.symbol ? decodeURIComponent(req.query.symbol.trim()) : null;
  const assetClass = req.query.assetClass?.toLowerCase();
  let sql = "SELECT * FROM pricestable WHERE 1=1";
  const params = [];

  if (symbol) { sql += " AND symbol = ?"; params.push(symbol); }
  if (assetClass) { sql += " AND LOWER(asset_class) = ?"; params.push(assetClass); }

  priceDb.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error: " + err.message });
    try {
      const parser = new Parser();
      const csv = parser.parse(rows);
      const filename = symbol ? `prices_${symbol.replace(/\W/g, "_")}.csv` : assetClass ? `prices_${assetClass}.csv` : "prices.csv";
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (e) {
      res.status(500).json({ error: "Failed to convert to CSV" });
    }
  });
});

// ------------------- Export PDF -------------------
app.post("/api/export/pdf", (req, res) => {
  const { tables, data } = req.body;
  if (!tables || !data) return res.status(400).json({ error: "Tables and data required" });

  try {
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="tables_report.pdf"');
    doc.pipe(res);

    doc.fontSize(16).text("Market Performance Report", { align: "center" });
    doc.moveDown();

    tables.forEach((table) => {
      doc.fontSize(14).text(table.name);
      doc.moveDown(0.2);
      doc.fontSize(10).text("Symbol | Close | Low | Change | Change %");
      doc.moveDown(0.1);

      table.symbols.forEach((sym) => {
        const row = data.find((d) => d.symbol.toLowerCase() === sym.toLowerCase());
        const line = row ? `${row.symbol} | ${row.close} | ${row.low} | ${row.change} | ${row.change_percent ?? "-"}` : `${sym} | - | - | - | -`;
        doc.text(line);
      });

      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Sign Up / Sign In -------------------
app.post("/api/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ message: "All fields required" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    userDb.run(`INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)`, [fullName, email, hashed], function (err) {
      if (err) return res.status(400).json({ message: "Email already exists" });
      res.json({ message: "Sign Up successful" });
    });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email & password required" });

  userDb.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!row) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, row.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Sign In successful", user: { id: row.id, fullName: row.fullName, email: row.email } });
  });
});

// ------------------- Email Sending -------------------

// SMTP transporter (example using Gmail, no password required for OAuth2 or app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password_or_blank_for_oauth2"
  }
});

// Manual test route (POST)
app.post("/api/email/send", (req, res) => {
  const { recipient, subject, text, tables, data } = req.body;
  if (!recipient) return res.status(400).json({ error: "Recipient required" });

  try {
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      transporter.sendMail({
        from: '"Market Reports" <your_email@gmail.com>',
        to: recipient,
        subject: subject || "Test Report",
        text: text || "Please find attached report",
        attachments: [{ filename: "report.pdf", content: pdfData }]
      }, (err, info) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Email sent successfully", info });
      });
    });

    doc.fontSize(16).text(subject || "Market Report", { align: "center" });
    doc.moveDown();
    tables?.forEach((table) => {
      doc.fontSize(14).text(table.name); doc.moveDown(0.2);
      table.symbols.forEach((sym) => {
        const row = data?.find((d) => d.symbol.toLowerCase() === sym.toLowerCase());
        const line = row ? `${row.symbol} | ${row.close} | ${row.low} | ${row.change} | ${row.change_percent ?? "-"}` : `${sym} | - | - | - | -`;
        doc.text(line);
      });
      doc.moveDown();
    });
    doc.end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ------------------- Daily Cron -------------------
cron.schedule("0 8 * * *", async () => {
  try {
    priceDb.all("SELECT * FROM pricestable ORDER BY close DESC LIMIT 10", [], (err, rows) => {
      if (err) return console.error("Cron DB error:", err);

      const doc = new PDFDocument({ size: "A4", margin: 30 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        transporter.sendMail({
          from: '"Market Reports" <your_email@gmail.com>',
          to: "recipient@example.com",
          subject: "Daily Market Report",
          text: "Please find attached the daily market report.",
          attachments: [{ filename: "daily_report.pdf", content: pdfData }]
        }, (err, info) => {
          if (err) console.error("Email error:", err);
          else console.log("Daily report sent:", info.response);
        });
      });

      doc.fontSize(16).text("Daily Market Report", { align: "center" });
      doc.moveDown();
      rows.forEach((row) => {
        doc.fontSize(12).text(`${row.symbol} | ${row.close} | ${row.low} | ${row.change} | ${row.change_percent ?? "-"}`);
      });

      doc.end();
    });
  } catch (err) { console.error("Cron error:", err); }
});

// ------------------- Start Server -------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
