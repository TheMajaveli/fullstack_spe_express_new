import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import type { Connection } from "mysql2/promise";
import { createMysqlConnectionWithRetry, getMysqlConfigFromEnv } from "./mysqlConnect";

function printMysqlConnectionHints(host: string, port: number) {
  console.error("");
  console.error("Vérifications :");
  console.error("  • MySQL est-il démarré ? (service local ou Docker)");
  console.error("  • Avec « docker compose -f docker-compose.dev.yml up -d », le port hôte est 3307 :");
  console.error("      Dans api/.env : DB_HOST=127.0.0.1  et  DB_PORT=3307");
  console.error("  • Attendre que le conteneur soit prêt : docker compose -f docker-compose.dev.yml ps");
  console.error("     ou : docker compose -f docker-compose.dev.yml up -d --wait");
  console.error("  • Premier démarrage MySQL : comptez parfois 30–60 s après « up ».");
  console.error(`  • Tentative actuelle : ${host}:${port} (user ${process.env.DB_USER || "cinenoir"})`);
  console.error("");
}

async function migrate() {
  const dbConfig = getMysqlConfigFromEnv();

  let connection: Connection;
  try {
    connection = await createMysqlConnectionWithRetry(dbConfig, {
      multipleStatements: true,
    });
  } catch (err: any) {
    if (err?.code === "ECONNREFUSED") {
      console.error("❌ Connexion MySQL refusée (aucun serveur à l’écoute sur ce port).");
    } else if (
      err?.code === "PROTOCOL_CONNECTION_LOST" ||
      String(err?.message || "").toLowerCase().includes("server closed")
    ) {
      console.error("❌ MySQL a fermé la connexion (souvent : mauvais port, ou serveur encore en initialisation).");
    } else {
      console.error("❌ Connexion MySQL impossible :", err?.message || err);
    }
    printMysqlConnectionHints(dbConfig.host, dbConfig.port);
    process.exit(1);
  }

  try {
    // Use process.cwd() to get the project root, then navigate to schema.sql
    const schemaPath = join(process.cwd(), "src", "database", "schema.sql");
    let schema = readFileSync(schemaPath, "utf-8");
    
    // Remove line comments (-- comments) but preserve structure
    schema = schema
      .split("\n")
      .map((line) => {
        const commentIdx = line.indexOf("--");
        return commentIdx >= 0 ? line.substring(0, commentIdx).trimEnd() : line;
      })
      .join("\n");
    
    // Remove CREATE DATABASE and USE statements (we're already connected to the DB)
    schema = schema.replace(/CREATE DATABASE[^;]+;/gi, "");
    schema = schema.replace(/USE\s+\w+\s*;/gi, "");
    
    // Split by semicolon, but be careful with multi-line statements
    const statements: string[] = [];
    let currentStatement = "";
    
    for (const line of schema.split("\n")) {
      currentStatement += line + "\n";
      if (line.trim().endsWith(";")) {
        const stmt = currentStatement.trim().replace(/;\s*$/, "").trim();
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        currentStatement = "";
      }
    }
    
    // Also handle any remaining statement
    if (currentStatement.trim().length > 0) {
      const stmt = currentStatement.trim().replace(/;\s*$/, "").trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
    }

    console.log(`Found ${statements.length} statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.query(statement);
          const preview = statement.split(/\s+/).slice(0, 4).join(" ").toUpperCase();
          console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        } catch (err: any) {
          // Ignore "already exists" errors
          if (
            err.code === "ER_TABLE_EXISTS_ERROR" ||
            err.code === "ER_DB_CREATE_EXISTS" ||
            err.code === "ER_DUP_ENTRY"
          ) {
            console.log(`⚠️  [${i + 1}/${statements.length}] Skipped (already exists)`);
          } else {
            console.error(`❌ [${i + 1}/${statements.length}] Failed:`, err.message);
            console.error(`Statement preview: ${statement.substring(0, 150)}...`);
            throw err;
          }
        }
      }
    }

    console.log("✅ Database migration completed successfully");

    try {
      await connection.query("ALTER TABLE movies ADD COLUMN trailerUrl VARCHAR(512) NULL");
      console.log("✅ Added column movies.trailerUrl");
    } catch (err: any) {
      if (err?.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️  movies.trailerUrl already exists");
      } else {
        throw err;
      }
    }

    try {
      await connection.query("ALTER TABLE movies ADD COLUMN descriptionFr TEXT NULL");
      console.log("✅ Added column movies.descriptionFr");
    } catch (err: any) {
      if (err?.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️  movies.descriptionFr already exists");
      } else {
        throw err;
      }
    }

    try {
      await connection.query(`
        DELETE m1 FROM movies m1
        INNER JOIN movies m2
          ON m1.year = m2.year
          AND TRIM(m1.title) = TRIM(m2.title)
          AND m1.id > m2.id
      `);
      console.log("✅ Removed duplicate movies (same title+year, kept lexicographically smallest id)");
    } catch (err: any) {
      console.log("⚠️  Duplicate movie cleanup:", err?.message || err);
    }

    try {
      await connection.query(
        "ALTER TABLE movies ADD UNIQUE KEY uq_movies_title_year (title(191), year)"
      );
      console.log("✅ Unique key uq_movies_title_year on movies (title + year)");
    } catch (err: any) {
      if (err?.code === "ER_DUP_KEYNAME") {
        console.log("⚠️  uq_movies_title_year already exists");
      } else if (err?.code === "ER_DUP_ENTRY") {
        console.error(
          "❌ Impossible d’ajouter l’unicité titre+année : des doublons subsistent. Exécutez : SELECT title, year, COUNT(*) c FROM movies GROUP BY title, year HAVING c > 1;"
        );
        throw err;
      } else {
        throw err;
      }
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await connection.end();
    process.exit(1);
  }
}

migrate();
