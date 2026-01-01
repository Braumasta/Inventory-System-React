require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db");

const users = [
  {
    email: "admin@example.com",
    password: process.env.POPULATE_ADMIN_PASSWORD || "ChangeMe123!",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  },
  {
    email: "employee@example.com",
    password: process.env.POPULATE_EMP_PASSWORD || "ChangeMe123!",
    firstName: "Employee",
    lastName: "User",
    role: "employee",
  },
];

const stores = [
  { name: "Main Store", location: "Head Office" },
  { name: "East Branch", location: "Harbor District" },
];

const items = [
  {
    sku: "SKU-001",
    name: "USB-C Cable",
    category: "Accessories",
    quantity: 120,
    location: "Aisle 1",
    price: 12.5,
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=320&q=60",
    storeName: "Main Store",
  },
  {
    sku: "SKU-002",
    name: "Wireless Mouse",
    category: "Peripherals",
    quantity: 45,
    location: "Aisle 2",
    price: 29.9,
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=320&q=60",
    storeName: "Main Store",
  },
  {
    sku: "SKU-003",
    name: "Laptop Stand",
    category: "Accessories",
    quantity: 30,
    location: "Aisle 3",
    price: 54.0,
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=320&q=60",
    storeName: "East Branch",
  },
];

async function ensureColumn(table, column, definition) {
  const [cols] = await pool.query(
    "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
    [table, column]
  );
  if (!cols.length) {
    try {
      await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch (err) {
      // Ignore if column already exists
      console.warn(`Warning altering ${table}.${column}: ${err.message}`);
    }
  }
}

async function ensureTablesAndColumns() {
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

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

  // Ensure columns exist for old tables
  await ensureColumn("items", "store_id", "INT NULL");
  await ensureColumn("inventory_events", "sku", "VARCHAR(64)");
  await ensureColumn("inventory_events", "detail", "TEXT");
  await ensureColumn("inventory_events", "delta", "INT");
}

async function ensureStores() {
  for (const s of stores) {
    await pool.query(
      "INSERT IGNORE INTO stores (name, location) VALUES (?, ?)",
      [s.name, s.location]
    );
  }
}

async function ensureUsers() {
  for (const u of users) {
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [u.email]);
    if (rows.length) continue;
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
      [u.email.toLowerCase(), hash, u.firstName, u.lastName, u.role]
    );
  }
}

async function getStoreIdByName(name) {
  const [rows] = await pool.query("SELECT id FROM stores WHERE name = ? LIMIT 1", [name]);
  return rows[0]?.id || null;
}

async function ensureItems() {
  for (const item of items) {
    const storeId = await getStoreIdByName(item.storeName);
    await pool.query(
      "INSERT INTO items (sku, name, category, quantity, location, price, image_url, store_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), quantity=VALUES(quantity), location=VALUES(location), price=VALUES(price), image_url=VALUES(image_url), store_id=VALUES(store_id)",
      [
        item.sku,
        item.name,
        item.category,
        item.quantity,
        item.location,
        item.price,
        item.imageUrl,
        storeId,
      ]
    );
  }
}

async function ensureOrderSample() {
  const [orderCountRows] = await pool.query("SELECT COUNT(*) AS cnt FROM orders");
  if (orderCountRows[0].cnt > 0) return;
  const [itemRows] = await pool.query("SELECT id, price, sku FROM items LIMIT 1");
  const [userRows] = await pool.query("SELECT id FROM users WHERE role='employee' LIMIT 1");
  if (!itemRows.length) return;
  const itemId = itemRows[0].id;
  const priceEach = Number(itemRows[0].price || 0);
  const qty = 2;
  const total = priceEach * qty;
  const userId = userRows[0]?.id || null;
  const [orderResult] = await pool.query(
    "INSERT INTO orders (user_id, total) VALUES (?, ?)",
    [userId, total]
  );
  await pool.query(
    "INSERT INTO order_items (order_id, item_id, quantity, price_each) VALUES (?, ?, ?, ?)",
    [orderResult.insertId, itemId, qty, priceEach]
  );
  await pool.query("UPDATE items SET quantity = GREATEST(quantity - ?, 0) WHERE id = ?", [qty, itemId]);
  await pool.query(
    "INSERT INTO inventory_events (item_id, sku, action, detail, delta) VALUES (?, ?, ?, ?, ?)",
    [itemId, itemRows[0].sku || null, "order", "Seed order", -qty]
  );
}

async function main() {
  try {
    await pool.query("SELECT 1");
    console.log("DB connection OK");

    await ensureTablesAndColumns();
    console.log("Schema ensured");

    await ensureStores();
    console.log("Stores ensured");

    await ensureUsers();
    console.log("Users ensured");

    await ensureItems();
    console.log("Items ensured");

    await ensureOrderSample();
    console.log("Orders ensured");

    console.log("Populate complete");
    process.exit(0);
  } catch (err) {
    console.error("Populate failed:", err.message);
    process.exit(1);
  }
}

main();
