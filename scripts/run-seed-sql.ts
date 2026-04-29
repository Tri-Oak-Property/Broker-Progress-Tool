import "dotenv/config";
import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    const sql = readFileSync(join(process.cwd(), "scripts/seed.sql"), "utf8");
    console.log("Connected. Running seed...");
    await client.query(sql);
    console.log("✓ Seed complete");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => { console.error(err.message); process.exit(1); });
