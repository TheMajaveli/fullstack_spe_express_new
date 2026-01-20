const pool = require("../config/database/db");

async function seedMoviesIfEmpty() {
  const [rows] = await pool.query("SELECT COUNT(*) AS c FROM movies");
  if (rows[0].c > 0) {
    console.log("Movies already present, skipping.");
    return;
  }

  const [cats] = await pool.query("SELECT id, name FROM categories");
  if (!cats.length) {
    console.warn("No categories found. Seed categories first.");
    return;
  }
  const idByName = Object.fromEntries(cats.map(c => [c.name, c.id]));
  const pick = (name, fallbackIndex = 0) =>
    idByName[name] ?? cats[fallbackIndex]?.id ?? null;

  const sample = [
    { title: "Edge of Battle",   director: "R. Chan",   release_year: 2019, rating: 7.6, category_id: pick("Action") },
    { title: "Silent Tears",     director: "M. Rivera", release_year: 2021, rating: 8.2, category_id: pick("Drama") },
    { title: "Office Follies",   director: "T. Wells",  release_year: 2020, rating: 6.9, category_id: pick("Comedy") },
    { title: "Gravity Shift",    director: "N. Patel",  release_year: 2013, rating: 7.7, category_id: pick("Sci-Fi") },
    { title: "Wild Hearts Doc",  director: "A. Gomez",  release_year: 2022, rating: 8.4, category_id: pick("Documentary") },
  ];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const m of sample) {
      await conn.query(
        `INSERT INTO movies (title, director, release_year, rating, category_id)
         VALUES (?, ?, ?, ?, ?)`,
        [m.title, m.director, m.release_year, m.rating, m.category_id]
      );
    }
    await conn.commit();
    console.log("Seeded movies.");
  } catch (e) {
    await conn.rollback();
    console.error("Movie seeding failed:", e);
  } finally {
    conn.release();
  }
}

module.exports = { seedMoviesIfEmpty };

