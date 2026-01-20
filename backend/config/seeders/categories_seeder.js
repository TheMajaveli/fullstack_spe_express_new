const pool = require("../config/database/db");

async function seedCategoriesIfEmpty() {
  const [rows] = await pool.query("SELECT COUNT(*) AS c FROM categories");
  if (rows[0].c > 0) {
    console.log("Categories already present, skipping.");
    return;
  }

  await pool.query(
    "INSERT INTO categories (name) VALUES (?), (?), (?), (?), (?)",
    ["Action", "Drama", "Comedy", "Sci-Fi", "Documentary"]
  );
  console.log("Seeded categories.");
}

module.exports = { seedCategoriesIfEmpty };

