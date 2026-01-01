require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const ensureSchema = async () => {
  // Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(50) DEFAULT 'employee',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Items
  await pool.query(`
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
  `);
  const itemAlters = [
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS sku VARCHAR(64) UNIQUE",
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS category VARCHAR(100)",
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS location VARCHAR(100)",
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT",
  ];
  for (const stmt of itemAlters) {
    await pool.query(stmt);
  }

  // Orders + line items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      item_id INT NOT NULL,
      quantity INT NOT NULL,
      price_each DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
    );
  `);
};

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth
app.post("/auth/register", async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
      [email.toLowerCase(), hash, firstName || "", lastName || "", role || "employee"]
    );
    const user = {
      id: result.insertId,
      email: email.toLowerCase(),
      firstName: firstName || "",
      lastName: lastName || "",
      role: role || "employee",
    };
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register failed:", err.message);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Could not register" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const [rows] = await pool.query(
      "SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?",
      [email.toLowerCase()]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login failed:", err.message);
    res.status(500).json({ error: "Could not login" });
  }
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

app.post("/items", authMiddleware, async (req, res) => {
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

app.put("/items/:id", authMiddleware, async (req, res) => {
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

app.delete("/items/:id", authMiddleware, async (req, res) => {
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

// Orders endpoint: create order and decrement stock
app.post("/orders", authMiddleware, async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: "No items provided" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;

    for (const line of items) {
      const itemId = Number(line.itemId);
      const qty = Number(line.quantity);
      if (!itemId || qty <= 0) throw new Error("Invalid item or quantity");
      const [rows] = await conn.query("SELECT id, price, quantity FROM items WHERE id = ? FOR UPDATE", [itemId]);
      if (!rows.length) throw new Error(`Item ${itemId} not found`);
      if (rows[0].quantity < qty) throw new Error(`Insufficient stock for item ${itemId}`);
      total += Number(rows[0].price || 0) * qty;
    }

    const [orderResult] = await conn.query(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [req.user?.sub || null, total]
    );
    const orderId = orderResult.insertId;

    for (const line of items) {
      const itemId = Number(line.itemId);
      const qty = Number(line.quantity);
      const [rows] = await conn.query("SELECT price FROM items WHERE id = ?", [itemId]);
      const priceEach = Number(rows[0].price || 0);
      await conn.query(
        "INSERT INTO order_items (order_id, item_id, quantity, price_each) VALUES (?, ?, ?, ?)",
        [orderId, itemId, qty, priceEach]
      );
      await conn.query("UPDATE items SET quantity = quantity - ? WHERE id = ?", [qty, itemId]);
    }

    await conn.commit();
    res.status(201).json({ orderId, total });
  } catch (err) {
    await conn.rollback();
    console.error("Order failed:", err.message);
    res.status(400).json({ error: err.message || "Could not create order" });
  } finally {
    conn.release();
  }
});

// Get orders (current user; admins see all)
app.get("/orders", authMiddleware, async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  const whereClause = isAdmin ? "" : "WHERE o.user_id = ?";
  const params = isAdmin ? [] : [req.user?.sub || 0];
  try {
    const [rows] = await pool.query(
      `
      SELECT
        o.id AS orderId,
        o.total,
        o.created_at AS createdAt,
        o.user_id AS userId,
        u.email AS userEmail,
        oi.item_id AS itemId,
        oi.quantity AS quantity,
        oi.price_each AS priceEach,
        i.sku AS sku,
        i.name AS itemName
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN items i ON i.id = oi.item_id
      ${whereClause}
      ORDER BY o.created_at DESC, o.id DESC
      `,
      params
    );

    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.orderId]) {
        grouped[row.orderId] = {
          id: row.orderId,
          total: Number(row.total || 0),
          createdAt: row.createdAt,
          userId: row.userId,
          userEmail: row.userEmail,
          items: [],
        };
      }
      if (row.itemId) {
        grouped[row.orderId].items.push({
          itemId: row.itemId,
          sku: row.sku,
          name: row.itemName,
          quantity: Number(row.quantity || 0),
          priceEach: Number(row.priceEach || 0),
        });
      }
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("Fetch orders failed:", err.message);
    res.status(500).json({ error: "Could not fetch orders" });
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
