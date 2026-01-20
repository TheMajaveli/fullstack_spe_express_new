const pool = require("../config/database/db");

// ========== FAVORIS ==========

async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.rating, m.director,
              m.category_id, c.name AS category, f.created_at AS favorited_at
       FROM favorites f
       JOIN movies m ON m.id = f.movie_id
       LEFT JOIN categories c ON c.id = m.category_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function addFavorite(req, res) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    // Vérifier que le film existe
    const [movie] = await pool.query("SELECT id FROM movies WHERE id = ?", [movieId]);
    if (!movie.length) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Vérifier si déjà en favoris
    const [existing] = await pool.query(
      "SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (existing.length) {
      return res.status(409).json({ message: "Movie already in favorites" });
    }

    await pool.query(
      "INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)",
      [userId, movieId]
    );

    res.status(201).json({ message: "Movie added to favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function removeFavorite(req, res) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const [result] = await pool.query(
      "DELETE FROM favorites WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Movie removed from favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

// ========== WATCHLIST ==========

async function getWatchlist(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.rating, m.director,
              m.category_id, c.name AS category, w.created_at AS added_at
       FROM watchlist w
       JOIN movies m ON m.id = w.movie_id
       LEFT JOIN categories c ON c.id = m.category_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function addToWatchlist(req, res) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    // Vérifier que le film existe
    const [movie] = await pool.query("SELECT id FROM movies WHERE id = ?", [movieId]);
    if (!movie.length) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Vérifier si déjà en watchlist
    const [existing] = await pool.query(
      "SELECT id FROM watchlist WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (existing.length) {
      return res.status(409).json({ message: "Movie already in watchlist" });
    }

    await pool.query(
      "INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)",
      [userId, movieId]
    );

    res.status(201).json({ message: "Movie added to watchlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function removeFromWatchlist(req, res) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const [result] = await pool.query(
      "DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Movie not found in watchlist" });
    }

    res.json({ message: "Movie removed from watchlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

// ========== NOTES ==========

async function getRatings(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
              m.id AS movie_id, m.title, m.release_year, m.director,
              c.name AS category
       FROM ratings r
       JOIN movies m ON m.id = r.movie_id
       LEFT JOIN categories c ON c.id = m.category_id
       WHERE r.user_id = ?
       ORDER BY r.updated_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function addRating(req, res) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    const { rating, comment } = req.body;

    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    if (!rating || Number.isNaN(parseFloat(rating))) {
      return res.status(400).json({ message: "Rating is required and must be a number" });
    }

    const ratingValue = parseFloat(rating);
    if (ratingValue < 0 || ratingValue > 10) {
      return res.status(400).json({ message: "Rating must be between 0 and 10" });
    }

    // Vérifier que le film existe
    const [movie] = await pool.query("SELECT id FROM movies WHERE id = ?", [movieId]);
    if (!movie.length) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Vérifier si note existe déjà
    const [existing] = await pool.query(
      "SELECT id FROM ratings WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (existing.length) {
      return res.status(409).json({ message: "Rating already exists. Use PUT to update." });
    }

    await pool.query(
      "INSERT INTO ratings (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)",
      [userId, movieId, ratingValue, comment || null]
    );

    res.status(201).json({ message: "Rating added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function updateRating(req, res) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    const { rating, comment } = req.body;

    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    if (rating !== undefined) {
      const ratingValue = parseFloat(rating);
      if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 10) {
        return res.status(400).json({ message: "Rating must be between 0 and 10" });
      }
    }

    const [existing] = await pool.query(
      "SELECT * FROM ratings WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Rating not found" });
    }

    const current = existing[0];
    const newRating = rating !== undefined ? parseFloat(rating) : current.rating;
    const newComment = comment !== undefined ? comment : current.comment;

    await pool.query(
      "UPDATE ratings SET rating = ?, comment = ? WHERE user_id = ? AND movie_id = ?",
      [newRating, newComment, userId, movieId]
    );

    res.json({ message: "Rating updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function deleteRating(req, res) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const [result] = await pool.query(
      "DELETE FROM ratings WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.json({ message: "Rating deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

// ========== HISTORIQUE ==========

async function getHistory(req, res) {
  try {
    const userId = req.user.id;
    const limit = Math.max(parseInt(req.query.limit || "50"), 1);
    
    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.release_year, m.rating, m.director,
              m.category_id, c.name AS category, vh.viewed_at
       FROM view_history vh
       JOIN movies m ON m.id = vh.movie_id
       LEFT JOIN categories c ON c.id = m.category_id
       WHERE vh.user_id = ?
       ORDER BY vh.viewed_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

async function addToHistory(req, res) {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    // Vérifier que le film existe
    const [movie] = await pool.query("SELECT id FROM movies WHERE id = ?", [movieId]);
    if (!movie.length) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Vérifier si déjà dans l'historique
    const [existing] = await pool.query(
      "SELECT id FROM view_history WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (existing.length) {
      // Mettre à jour la date de consultation
      await pool.query(
        "UPDATE view_history SET viewed_at = NOW() WHERE user_id = ? AND movie_id = ?",
        [userId, movieId]
      );
    } else {
      // Insérer une nouvelle entrée
      await pool.query(
        "INSERT INTO view_history (user_id, movie_id) VALUES (?, ?)",
        [userId, movieId]
      );
    }

    res.status(201).json({ message: "View recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}

module.exports = {
  // Favoris
  getFavorites,
  addFavorite,
  removeFavorite,
  // Watchlist
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  // Notes
  getRatings,
  addRating,
  updateRating,
  deleteRating,
  // Historique
  getHistory,
  addToHistory,
};

