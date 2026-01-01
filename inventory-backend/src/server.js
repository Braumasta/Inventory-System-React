require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
  })
);
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
      middle_name VARCHAR(100),
      last_name VARCHAR(100),
      dob DATE,
      role VARCHAR(50) DEFAULT 'employee',
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sku VARCHAR(64) UNIQUE,
      name VARCHAR(255) NOT NULL,
      store_id INT,
      category VARCHAR(100),
      quantity INT NOT NULL DEFAULT 0,
      location VARCHAR(100),
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
    );
  `);

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT,
      sku VARCHAR(64),
      action VARCHAR(50),
      detail TEXT,
      delta INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
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

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth
app.post("/auth/register", async (req, res) => {
  const { email, password, firstName, middleName, lastName, dob, role, avatarUrl } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash, first_name, middle_name, last_name, dob, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        email.toLowerCase(),
        hash,
        firstName || "",
        middleName || "",
        lastName || "",
        dob || null,
        role || "employee",
        avatarUrl || null,
      ]
    );
    const user = {
      id: result.insertId,
      email: email.toLowerCase(),
      firstName: firstName || "",
      middleName: middleName || "",
      lastName: lastName || "",
      dob: dob || null,
      role: role || "employee",
      avatarUrl: avatarUrl || null,
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
      "SELECT id, email, password_hash, first_name, middle_name, last_name, dob, role, avatar_url FROM users WHERE email = ?",
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
        middleName: user.middle_name,
        lastName: user.last_name,
        dob: user.dob,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
      token,
    });
  } catch (err) {
    console.error("Login failed:", err.message);
    res.status(500).json({ error: "Could not login" });
  }
});

// Current user profile
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, email, first_name AS firstName, middle_name AS middleName, last_name AS lastName, dob, role, avatar_url AS avatarUrl FROM users WHERE id = ?",
      [req.user?.sub]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("/me failed:", err.message);
    res.status(500).json({ error: "Could not fetch profile" });
  }
});

app.put("/me", authMiddleware, async (req, res) => {
  const { firstName = "", middleName = "", lastName = "", dob = null, avatarUrl = null } = req.body || {};
  try {
    await pool.query(
      "UPDATE users SET first_name = ?, middle_name = ?, last_name = ?, dob = ?, avatar_url = ? WHERE id = ?",
      [firstName, middleName, lastName, dob || null, avatarUrl, req.user?.sub]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Update profile failed:", err.message);
    res.status(500).json({ error: "Could not update profile" });
  }
});

app.post("/auth/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword) return res.status(400).json({ error: "New password required" });
  try {
    const [rows] = await pool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [req.user?.sub]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    const ok = await bcrypt.compare(currentPassword || "", rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: "Current password incorrect" });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.user?.sub]);
    res.json({ success: true });
  } catch (err) {
    console.error("Password change failed:", err.message);
    res.status(500).json({ error: "Could not update password" });
  }
});

// Example items endpoint (expects a table named `items`)
app.get("/items", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, sku, name, category, quantity, location, price, image_url AS imageUrl, store_id AS storeId, created_at FROM items ORDER BY id DESC LIMIT 200"
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
      storeId: body.storeId ? Number(body.storeId) : null,
    },
  };
};

app.post("/items", authMiddleware, async (req, res) => {
  const { errors, payload } = validateItemPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  try {
    const sql = `
      INSERT INTO items (sku, name, category, quantity, location, price, image_url, store_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      payload.sku || null,
      payload.name,
      payload.category,
      payload.quantity,
      payload.location,
      payload.price,
      payload.imageUrl,
      payload.storeId,
    ];
    const [result] = await pool.query(sql, params);
    const [rows] = await pool.query(
      "SELECT id, sku, name, category, quantity, location, price, image_url AS imageUrl, created_at FROM items WHERE id = ?",
      [result.insertId]
    );
    await pool.query(
      "INSERT INTO inventory_events (item_id, sku, action, detail, delta) VALUES (?, ?, ?, ?, ?)",
      [result.insertId, payload.sku || null, "create", "Item created", payload.quantity || 0]
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
      SET sku = ?, name = ?, category = ?, quantity = ?, location = ?, price = ?, image_url = ?, store_id = ? WHERE id = ?
    `;
    const params = [
      payload.sku || null,
      payload.name,
      payload.category,
      payload.quantity,
      payload.location,
      payload.price,
      payload.imageUrl,
      payload.storeId,
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
    await pool.query(
      "INSERT INTO inventory_events (item_id, sku, action, detail, delta) VALUES (?, ?, ?, ?, ?)",
      [id, payload.sku || null, "update", "Item updated", 0]
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
    const [itemRows] = await pool.query("SELECT sku FROM items WHERE id = ?", [id]);
    const [result] = await pool.query("DELETE FROM items WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    await pool.query(
      "INSERT INTO inventory_events (item_id, sku, action, detail, delta) VALUES (?, ?, ?, ?, ?)",
      [id, itemRows[0]?.sku || null, "delete", "Item deleted", 0]
    );
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
      const [rows] = await conn.query("SELECT id, price, quantity, sku FROM items WHERE id = ? FOR UPDATE", [itemId]);
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
      const [rows] = await conn.query("SELECT price, sku FROM items WHERE id = ?", [itemId]);
      const priceEach = Number(rows[0].price || 0);
      const sku = rows[0]?.sku || null;
      await conn.query(
        "INSERT INTO order_items (order_id, item_id, quantity, price_each) VALUES (?, ?, ?, ?)",
        [orderId, itemId, qty, priceEach]
      );
      await conn.query("UPDATE items SET quantity = quantity - ? WHERE id = ?", [qty, itemId]);
      await conn.query(
        "INSERT INTO inventory_events (item_id, sku, action, detail, delta) VALUES (?, ?, ?, ?, ?)",
        [itemId, sku, "order", "Order placed", -qty]
      );
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

// Stores CRUD (simple)
app.get("/stores", authMiddleware, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, location, created_at AS createdAt FROM stores ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Fetch stores failed:", err.message);
    res.status(500).json({ error: "Could not fetch stores" });
  }
});

app.post("/stores", authMiddleware, requireAdmin, async (req, res) => {
  const name = (req.body?.name || "").toString().trim();
  const location = (req.body?.location || "").toString().trim();
  if (!name) return res.status(400).json({ error: "Name required" });
  try {
    const [result] = await pool.query(
      "INSERT INTO stores (name, location) VALUES (?, ?)",
      [name, location || null]
    );
    const [rows] = await pool.query(
      "SELECT id, name, location, created_at AS createdAt FROM stores WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create store failed:", err.message);
    res.status(500).json({ error: "Could not create store" });
  }
});

app.put("/stores/:id", authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const name = (req.body?.name || "").toString().trim();
  const location = (req.body?.location || "").toString().trim();
  if (!name) return res.status(400).json({ error: "Name required" });
  try {
    const [result] = await pool.query(
      "UPDATE stores SET name = ?, location = ? WHERE id = ?",
      [name, location || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Store not found" });
    const [rows] = await pool.query(
      "SELECT id, name, location, created_at AS createdAt FROM stores WHERE id = ?",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Update store failed:", err.message);
    res.status(500).json({ error: "Could not update store" });
  }
});

app.delete("/stores/:id", authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [result] = await pool.query("DELETE FROM stores WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Store not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete store failed:", err.message);
    res.status(500).json({ error: "Could not delete store" });
  }
});

// Users list (admin)
app.get("/users", authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, email, first_name AS firstName, last_name AS lastName, role, created_at AS createdAt FROM users ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch users failed:", err.message);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

app.put("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const role = (req.body?.role || "").toString().trim();
  if (!role) return res.status(400).json({ error: "Role required" });
  try {
    const [result] = await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Update user failed:", err.message);
    res.status(500).json({ error: "Could not update user" });
  }
});

// Inventory events (admin)
app.get("/inventory-events", authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, item_id AS itemId, sku, action, detail, delta, created_at AS createdAt FROM inventory_events ORDER BY id DESC LIMIT 500"
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch inventory events failed:", err.message);
    res.status(500).json({ error: "Could not fetch inventory events" });
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

