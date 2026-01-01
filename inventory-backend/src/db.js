const mysql = require("mysql2/promise");

// Allow Railway connection strings (MYSQL_URL / DATABASE_URL) or manual env values
const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;

let poolConfig;
if (connectionString) {
  const url = new URL(connectionString);
  poolConfig = {
    host: url.hostname,
    port: url.port || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ""),
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  };
}

// Create a pooled connection to reuse sockets efficiently
const pool = mysql.createPool({
  ...poolConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
