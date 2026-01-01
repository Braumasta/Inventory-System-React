require("dotenv").config();
const pool = require("./db");

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

async function ensureStores() {
  for (const s of stores) {
    await pool.query(
      "INSERT IGNORE INTO stores (name, location) VALUES (?, ?)",
      [s.name, s.location]
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
      "INSERT IGNORE INTO items (sku, name, category, quantity, location, price, image_url, store_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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

async function main() {
  try {
    await pool.query("SELECT 1");
    console.log("DB connection OK");

    await ensureStores();
    console.log("Stores ensured");

    await ensureItems();
    console.log("Items ensured");

    const [orderCountRows] = await pool.query("SELECT COUNT(*) AS cnt FROM orders");
    if (orderCountRows[0].cnt === 0) {
      const [itemRows] = await pool.query("SELECT id, price FROM items LIMIT 1");
      if (itemRows.length) {
        const itemId = itemRows[0].id;
        const priceEach = Number(itemRows[0].price || 0);
        const qty = 2;
        const total = priceEach * qty;
        const [orderResult] = await pool.query(
          "INSERT INTO orders (user_id, total) VALUES (?, ?)",
          [null, total]
        );
        await pool.query(
          "INSERT INTO order_items (order_id, item_id, quantity, price_each) VALUES (?, ?, ?, ?)",
          [orderResult.insertId, itemId, qty, priceEach]
        );
        await pool.query("UPDATE items SET quantity = GREATEST(quantity - ?, 0) WHERE id = ?", [qty, itemId]);
        await pool.query(
          "INSERT INTO inventory_events (item_id, sku, action, detail, delta) VALUES (?, (SELECT sku FROM items WHERE id = ?), 'order', 'Seed order', ?)",
          [itemId, itemId, -qty]
        );
        console.log("Seed order created");
      }
    }

    console.log("Populate complete");
    process.exit(0);
  } catch (err) {
    console.error("Populate failed:", err.message);
    process.exit(1);
  }
}

main();
