const mysql = require("mysql2/promise");
require("dotenv").config();

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    multipleStatements: true,
  });

  const sql = `
  USE movies_db;

  CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_email (email)
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_token (token),
    CONSTRAINT fk_refresh_tokens_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS favorites (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    movie_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_movie (user_id, movie_id),
    KEY idx_user_id (user_id),
    KEY idx_movie_id (movie_id),
    CONSTRAINT fk_favorites_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_favorites_movie
      FOREIGN KEY (movie_id) REFERENCES movies(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS ratings (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    movie_id INT UNSIGNED NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_movie_rating (user_id, movie_id),
    KEY idx_user_id (user_id),
    KEY idx_movie_id (movie_id),
    CONSTRAINT fk_ratings_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ratings_movie
      FOREIGN KEY (movie_id) REFERENCES movies(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_rating_range CHECK (rating >= 0 AND rating <= 10)
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS view_history (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    movie_id INT UNSIGNED NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_viewed_at (viewed_at),
    CONSTRAINT fk_view_history_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_view_history_movie
      FOREIGN KEY (movie_id) REFERENCES movies(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS watchlist (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    movie_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_movie_watchlist (user_id, movie_id),
    KEY idx_user_id (user_id),
    KEY idx_movie_id (movie_id),
    CONSTRAINT fk_watchlist_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_watchlist_movie
      FOREIGN KEY (movie_id) REFERENCES movies(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS movie_images (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    movie_id INT UNSIGNED NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_movie_id (movie_id),
    CONSTRAINT fk_movie_images_movie
      FOREIGN KEY (movie_id) REFERENCES movies(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB;
  `;

  try {
    console.log("Running auth migration...");
    await connection.query(sql);
    console.log("Auth tables created successfully!");
  } catch (error) {
    console.error("Auth migration failed:", error);
  } finally {
    await connection.end();
  }
})();

