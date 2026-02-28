import fs from "fs";
import path from "path";
import pg from "pg";

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  // Create migrations tracking table
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT now()
    )
  `);

  const { rows: applied } = await client.query(`SELECT name FROM _migrations ORDER BY id`);
  const appliedSet = new Set(applied.map((r) => r.name));

  const migrationsDir = path.join(import.meta.dirname, ".");
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  skip: ${file} (already applied)`);
      continue;
    }

    console.log(`  apply: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(`INSERT INTO _migrations (name) VALUES ($1)`, [file]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  FAILED: ${file}`, err);
      process.exit(1);
    }
  }

  console.log("Migrations complete.");
  await client.end();
}

migrate();
