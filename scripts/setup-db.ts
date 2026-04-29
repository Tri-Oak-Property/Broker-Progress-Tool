import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function setup() {
  console.log("Creating schema...");

  await sql`CREATE TYPE IF NOT EXISTS side AS ENUM ('buyer', 'seller', 'buyer_seller')`;
  await sql`CREATE TYPE IF NOT EXISTS lost_stage AS ENUM ('loi', 'under_contract')`;

  await sql`
    CREATE TABLE IF NOT EXISTS advisors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_name TEXT NOT NULL,
      advisor_id UUID NOT NULL REFERENCES advisors(id),
      client_or_property TEXT,
      side side NOT NULL,
      loi_date DATE,
      loi_expected_commission NUMERIC(12,2),
      under_contract_date DATE,
      hopper_gain_amount NUMERIC(12,2),
      expected_close_date DATE,
      closed_date DATE,
      closed_commission NUMERIC(12,2),
      lost_date DATE,
      lost_stage lost_stage,
      lost_amount NUMERIC(12,2),
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  console.log("✓ Tables created successfully");
  process.exit(0);
}

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});
