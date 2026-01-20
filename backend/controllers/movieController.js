const pool = require("../config/database/db");
const path = require("path");
const fs = require("fs");

async function getAllMovies(req, res) {
  try {
    // Paramètres de pagination
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.max(parseInt(req.query.limit || "50"), 1);
    const offset = (page - 1) * limit;

    // Paramètres de filtres
    const category = req.query.category ? parseInt(req.query.category) : null;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating) : null;
    const search = req.query.search ? req.query.search.trim() : null;

    // Paramètres de tri
    const sortParam = req.query.sort || "id";
    let orderBy = "m.id ASC";
    
    switch (sortParam) {
      case "title":
        orderBy = "m.title ASC";
        break;
      case "title_desc":
        orderBy = "m.title DESC";
        break;
      case "year":
        orderBy = "m.release_year ASC";
        break;
      case "year_desc":
        orderBy = "m.release_year DESC";
        break;
      case "rating":
        orderBy = "m.rating ASC";
        break;
      case "rating_desc":
        orderBy = "m.rating DESC";
        break;
      default:
        orderBy = "m.id ASC";
    }

    // Construction de la clause WHERE
    const conditions = [];
    const params = [];

    if (category !== null && !Number.isNaN(category)) {
      conditions.push("m.category_id = ?");
      params.push(category);
    }

    if (minRating !== null && !Number.isNaN(minRating)) {
      conditions.push("m.rating >= ?");
      params.push(minRating);
    }

    if (search) {
      conditions.push("(m.title LIKE ? OR m.director LIKE ?)");
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // Requête pour compter le total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
       FROM movies m
       LEFT JOIN categories c ON c.id = m.category_id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Requête pour récupérer les films
    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.rating, m.director,
              m.category_id, c.name AS category
       FROM movies m
       LEFT JOIN categories c ON c.id = m.category_id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function getMovieById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.rating, m.director,
              m.category_id, c.name AS category
       FROM movies m
       LEFT JOIN categories c ON c.id = m.category_id
       WHERE m.id = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "Movie not found" });
    
    // Récupérer les images du film
    const [images] = await pool.query(
      `SELECT id, image_path, is_primary
       FROM movie_images
       WHERE movie_id = ?
       ORDER BY is_primary DESC, created_at ASC`,
      [id]
    );

    const movie = rows[0];
    movie.images = images.map(img => ({
      id: img.id,
      path: `/uploads/${path.basename(img.image_path)}`,
      isPrimary: Boolean(img.is_primary),
    }));

    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function createMovie(req, res) {
  try {
    const { title, release_year = null, rating = null, category_id = null, director = null } = req.body || {};
    if (!title) return res.status(400).json({ message: "title is required" });
    if (!director) return res.status(400).json({ message: "director is required" });

    if (category_id != null) {
      const [c] = await pool.query("SELECT id FROM categories WHERE id=?", [category_id]);
      if (!c.length) return res.status(400).json({ message: "Invalid category_id" });
    }

    const [result] = await pool.query(
      "INSERT INTO movies (title, release_year, director, rating, category_id) VALUES (?, ?, ?, ?, ?)",
      [title, release_year, director, rating, category_id]
    );

    const movieId = result.insertId;

    // Gérer l'upload d'image si présent
    if (req.file) {
      const imagePath = req.file.path;
      const isPrimary = true; // Première image = primaire par défaut
      
      await pool.query(
        "INSERT INTO movie_images (movie_id, image_path, is_primary) VALUES (?, ?, ?)",
        [movieId, imagePath, isPrimary]
      );
    }

    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.rating, m.director,
              m.category_id, c.name AS category
       FROM movies m LEFT JOIN categories c ON c.id = m.category_id
       WHERE m.id = ?`,
      [movieId]
    );

    // Récupérer les images
    const [images] = await pool.query(
      `SELECT id, image_path, is_primary
       FROM movie_images
       WHERE movie_id = ?
       ORDER BY is_primary DESC, created_at ASC`,
      [movieId]
    );

    const movie = rows[0];
    movie.images = images.map(img => ({
      id: img.id,
      path: `/uploads/${path.basename(img.image_path)}`,
      isPrimary: Boolean(img.is_primary),
    }));

    res.status(201).json(movie);
  } catch (err) {
    // Nettoyer le fichier uploadé en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (!res.headersSent) {
      console.error(err);
      res.status(500).json({ message: "Database error" });
    }
  }
}

async function updateMovie(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

    const [existing] = await pool.query("SELECT * FROM movies WHERE id=?", [id]);
    if (!existing.length) return res.status(404).json({ message: "Movie not found" });

    const current = existing[0];
    const title = req.body.title ?? current.title;
    const release_year = req.body.release_year ?? current.release_year;
    const rating = req.body.rating ?? current.rating;
    const category_id = req.body.category_id ?? current.category_id;
    const director = req.body.director ?? current.director;

    if (category_id != null) {
      const [c] = await pool.query("SELECT id FROM categories WHERE id=?", [category_id]);
      if (!c.length) return res.status(400).json({ message: "Invalid category_id" });
    }

    await pool.query(
      "UPDATE movies SET title=?, release_year=?, director=?, rating=?, category_id=? WHERE id=?",
      [title, release_year, director, rating, category_id, id]
    );

    // Gérer l'upload d'image si présent
    if (req.file) {
      const imagePath = req.file.path;
      // Vérifier s'il y a déjà une image primaire
      const [existingImages] = await pool.query(
        "SELECT id FROM movie_images WHERE movie_id = ? AND is_primary = 1",
        [id]
      );
      const isPrimary = existingImages.length === 0;
      
      await pool.query(
        "INSERT INTO movie_images (movie_id, image_path, is_primary) VALUES (?, ?, ?)",
        [id, imagePath, isPrimary]
      );
    }

    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.rating, m.director,
              m.category_id, c.name AS category
       FROM movies m LEFT JOIN categories c ON c.id = m.category_id
       WHERE m.id = ?`,
      [id]
    );

    // Récupérer les images
    const [images] = await pool.query(
      `SELECT id, image_path, is_primary
       FROM movie_images
       WHERE movie_id = ?
       ORDER BY is_primary DESC, created_at ASC`,
      [id]
    );

    const movie = rows[0];
    movie.images = images.map(img => ({
      id: img.id,
      path: `/uploads/${path.basename(img.image_path)}`,
      isPrimary: Boolean(img.is_primary),
    }));

    res.json(movie);
  } catch (err) {
    // Nettoyer le fichier uploadé en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (!res.headersSent) {
      console.error(err);
      res.status(500).json({ message: "Database error" });
    }
  }
}

async function deleteMovie(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

    const [result] = await pool.query("DELETE FROM movies WHERE id=?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function getMoviesByCategory(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid category id" });

    const [cat] = await pool.query("SELECT id, name FROM categories WHERE id=?", [id]);
    if (!cat.length) return res.status(404).json({ message: "Category not found" });

    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.rating, m.director,
              m.category_id, ? AS category
       FROM movies m
       WHERE m.category_id = ?
       ORDER BY m.id ASC`,
      [cat[0].name, id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviesByCategory,
};

