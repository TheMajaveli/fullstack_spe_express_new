const pool = require("../config/database/db");

async function getAllCategories(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM categories ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function getCategoryById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

    const [rows] = await pool.query("SELECT id, name FROM categories WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Category not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function createCategory(req, res) {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: "name is required" });

  try {
    const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [name]);
    const [rows] = await pool.query("SELECT id, name FROM categories WHERE id=?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Category already exists" });
    console.error(e);
    res.status(500).json({ message: "Failed to create category" });
  }
}

async function updateCategory(req, res) {
  const id = parseInt(req.params.id);
  const { name } = req.body || {};
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
  if (!name) return res.status(400).json({ message: "name is required" });

  try {
    const [result] = await pool.query("UPDATE categories SET name=? WHERE id=?", [name, id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Category not found" });
    const [rows] = await pool.query("SELECT id, name FROM categories WHERE id=?", [id]);
    res.json(rows[0]);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Category already exists" });
    console.error(e);
    res.status(500).json({ message: "Failed to update category" });
  }
}

async function deleteCategory(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

    const [result] = await pool.query("DELETE FROM categories WHERE id=?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

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

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategoriesIfEmpty,
};

