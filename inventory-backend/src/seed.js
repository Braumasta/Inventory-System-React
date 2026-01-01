require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db");

const sampleItems = [
  {
    sku: "SKU-001",
    name: "USB-C Cable",
    category: "Accessories",
    quantity: 120,
    location: "Aisle 1",
    price: 12.5,
    imageUrl: "",
  },
  {
    sku: "SKU-002",
    name: "Wireless Mouse",
    category: "Peripherals",
    quantity: 45,
    location: "Aisle 2",
    price: 29.9,
    imageUrl: "",
  },
  {
    sku: "SKU-003",
    name: "Laptop Stand",
    category: "Accessories",
    quantity: 30,
    location: "Aisle 3",
    price: 54.0,
    imageUrl: "",
  },
];

async function seed() {
  try {
    // Seed admin user if none exist
    const [userCount] = await pool.query("SELECT COUNT(*) AS cnt FROM users");
    if (userCount[0].cnt === 0) {
      const adminPass = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
      const hash = await bcrypt.hash(adminPass, 10);
      await pool.query(
        "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
        ["admin@example.com", hash, "Admin", "User", "admin"]
      );
      console.log(`Seeded admin user admin@example.com with password ${adminPass}`);
    }

    const [countRows] = await pool.query("SELECT COUNT(*) AS cnt FROM items");
    if (countRows[0].cnt > 0) {
      console.log("Items table already has data; skipping seed.");
      process.exit(0);
    }

    const insertSql = `
      INSERT INTO items (sku, name, category, quantity, location, price, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    for (const item of sampleItems) {
      await pool.query(insertSql, [
        item.sku,
        item.name,
        item.category,
        item.quantity,
        item.location,
        item.price,
        item.imageUrl,
      ]);
    }
    console.log(`Inserted ${sampleItems.length} sample items.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
