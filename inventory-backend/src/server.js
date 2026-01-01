require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Example items endpoint (expects a table named `items`)
app.get("/items", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM items LIMIT 50");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch items:", err.message);
    res.status(500).json({ error: "Could not fetch items" });
  }
});

const port = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection established");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
}

start();
