require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const ensureSchema = async () => {
  // Ensure the items table has the columns we expect
  const createSql = `
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sku VARCHAR(64) UNIQUE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      quantity INT NOT NULL DEFAULT 0,
      location VARCHAR(100),
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createSql);

  // Add columns if the table already existed without them (MySQL 8+)
  const alters = [
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS sku VARCHAR(64) UNIQUE",
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS category VARCHAR(100)",
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS location VARCHAR(100)",
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT",
  ];
  for (const stmt of alters) {
    await pool.query(stmt);
  }
};

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Example items endpoint (expects a table named `items`)
app.get("/items", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, sku, name, category, quantity, location, price, image_url AS imageUrl, created_at FROM items ORDER BY id DESC LIMIT 200"
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch items:", err.message);
    res.status(500).json({ error: "Could not fetch items" });
  }
});

const validateItemPayload = (body) => {
  const errors = [];
  const name = (body.name || "").toString().trim();
  if (!name) errors.push("name is required");

  const quantity = Number(body.quantity);
  if (Number.isNaN(quantity) || quantity < 0) errors.push("quantity must be a non-negative number");

  const price = Number(body.price);
  if (Number.isNaN(price) || price < 0) errors.push("price must be a non-negative number");

  return {
    errors,
    payload: {
      sku: body.sku ? body.sku.toString().trim() : null,
      name,
      category: body.category ? body.category.toString().trim() : null,
      quantity: Number.isNaN(quantity) ? 0 : quantity,
      location: body.location ? body.location.toString().trim() : null,
      price: Number.isNaN(price) ? 0 : price,
      imageUrl: body.imageUrl ? body.imageUrl.toString().trim() : null,
    },
  };
};

app.post("/items", async (req, res) => {
  const { errors, payload } = validateItemPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  try {
    const sql = `
      INSERT INTO items (sku, name, category, quantity, location, price, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      payload.sku || null,
      payload.name,
      payload.category,
      payload.quantity,
      payload.location,
      payload.price,
      payload.imageUrl,
    ];
    const [result] = await pool.query(sql, params);
    const [rows] = await pool.query(
      "SELECT id, sku, name, category, quantity, location, price, image_url AS imageUrl, created_at FROM items WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Failed to create item:", err.message);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "SKU already exists" });
    }
    res.status(500).json({ error: "Could not create item" });
  }
});

app.put("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  const { errors, payload } = validateItemPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  try {
    const sql = `
      UPDATE items
      SET sku = ?, name = ?, category = ?, quantity = ?, location = ?, price = ?, image_url = ?
      WHERE id = ?
    `;
    const params = [
      payload.sku || null,
      payload.name,
      payload.category,
      payload.quantity,
      payload.location,
      payload.price,
      payload.imageUrl,
      id,
    ];
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    const [rows] = await pool.query(
      "SELECT id, sku, name, category, quantity, location, price, image_url AS imageUrl, created_at FROM items WHERE id = ?",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Failed to update item:", err.message);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "SKU already exists" });
    }
    res.status(500).json({ error: "Could not update item" });
  }
});

app.delete("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  try {
    const [result] = await pool.query("DELETE FROM items WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete item:", err.message);
    res.status(500).json({ error: "Could not delete item" });
  }
});

const port = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection established");

    await ensureSchema();
    console.log("Schema ensured");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
}

start();
