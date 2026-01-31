import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const sql = `
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "login_id" TEXT;
UPDATE "users"
SET "login_id" = COALESCE("login_id", SUBSTRING(MD5("id"::text) FOR 8));
ALTER TABLE "users" ALTER COLUMN "login_id" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_login_id_key" ON "users"("login_id");
`;

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
    console.log("login_id column ensured");
  } finally {
    await client.end();
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
