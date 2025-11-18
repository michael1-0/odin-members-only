import { Client } from "pg";
import { config } from "dotenv";

config();

const SQL = `
DROP TABLE IF EXISTS users, session, messages;

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(60),
  membership_status BOOLEAN,
  admin BOOLEAN DEFAULT false
);

CREATE TABLE messages (
  message_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER NOT NULL,
  title VARCHAR(100),
  timestamp TIMESTAMP,
  text TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

`;

async function main() {
  try {
    console.log("seeding...");
    const client = new Client({ connectionString: process.env.PG_STRING });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done.");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(1)
  }
}

main();
