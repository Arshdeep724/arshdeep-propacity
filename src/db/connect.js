import postgres from "pg";
const { Pool } = postgres;
export const pool = new Pool({
  user: "my_user",
  host: "localhost",
  password: "my_password",
  database: "my_database",
  port: parseInt(5432),
});
