import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "cinenoir",
  password: process.env.DB_PASSWORD || "cinenoir",
  database: process.env.DB_NAME || "cinenoir",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export { pool as db };
