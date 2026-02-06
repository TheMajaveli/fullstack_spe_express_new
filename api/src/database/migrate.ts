import { readFileSync } from "fs";
import { join } from "path";
import mysql from "mysql2/promise";

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "cinenoir",
    password: process.env.DB_PASSWORD || "cinenoir",
    database: process.env.DB_NAME || "cinenoir",
    multipleStatements: true,
  });

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
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await connection.end();
    process.exit(1);
  }
}

migrate();
