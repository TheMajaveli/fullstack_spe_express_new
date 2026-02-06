-- CineNoir Database Schema

CREATE DATABASE IF NOT EXISTS cinenoir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinenoir;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id VARCHAR(255) PRIMARY KEY,
  tokenHash VARCHAR(255) UNIQUE NOT NULL,
  userId VARCHAR(255) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_tokenHash (tokenHash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id CHAR(36) PRIMARY KEY,
  tokenHash VARCHAR(255) NOT NULL UNIQUE,
  userId CHAR(36) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_token_hash (tokenHash),
  INDEX idx_reset_token_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  releaseDate DATETIME NOT NULL,
  year INT NOT NULL,
  duration VARCHAR(50),
  director VARCHAR(255),
  ratingAvg FLOAT DEFAULT 0,
  posterUrl VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_year (year),
  INDEX idx_ratingAvg (ratingAvg)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Movie categories junction table
CREATE TABLE IF NOT EXISTS movie_categories (
  movieId VARCHAR(255) NOT NULL,
  categoryId VARCHAR(255) NOT NULL,
  PRIMARY KEY (movieId, categoryId),
  FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_categoryId (categoryId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  userId VARCHAR(255) NOT NULL,
  movieId VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, movieId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_movieId (movieId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  userId VARCHAR(255) NOT NULL,
  movieId VARCHAR(255) NOT NULL,
  ratingNumber INT NOT NULL CHECK (ratingNumber >= 0 AND ratingNumber <= 10),
  note TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, movieId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_movieId (movieId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- History table
CREATE TABLE IF NOT EXISTS history (
  userId VARCHAR(255) NOT NULL,
  movieId VARCHAR(255) NOT NULL,
  seenAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, movieId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_movieId (movieId),
  INDEX idx_seenAt (seenAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
