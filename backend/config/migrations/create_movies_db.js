const mysql = require("mysql2/promise");
require("dotenv").config();

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 3306),
    multipleStatements: true,
  });

  const sql = `
  CREATE DATABASE IF NOT EXISTS movies_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_0900_ai_ci;

  USE movies_db;

  CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(191) NOT NULL UNIQUE,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS movies (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(191) NOT NULL,
    director VARCHAR(191) NOT NULL,
    release_year INT UNSIGNED NULL,
    rating DECIMAL(3,1) NULL,
    category_id INT UNSIGNED NULL,
    PRIMARY KEY (id),
    KEY idx_category_id (category_id),
    CONSTRAINT fk_movies_category
      FOREIGN KEY (category_id) REFERENCES categories(id)
      ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB;
  `;

  try {
    console.log("Running migration...");
    await connection.query(sql);
    console.log("Database and tables created successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await connection.end();
  }
})();

