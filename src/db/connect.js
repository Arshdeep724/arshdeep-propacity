import postgres from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = postgres;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
});
