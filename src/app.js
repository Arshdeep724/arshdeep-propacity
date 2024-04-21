import express from "express";
import { pool } from "./db/connect.js";
import { AuthRouter } from "./auth/auth.routes.js";
import { FolderRouter } from "./folder/folder.routes.js";
import dotenv from "dotenv";
import { verifyToken } from "./auth/middleware/auth.middleware.js";

const app = express();

dotenv.config();
app.use(express.json());
app.use(verifyToken);

try {
  await pool.connect();
  console.log("Connected to the database!");
} catch (error) {
  console.error("Error connecting to the database:", error);
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("Server Health is Ok");
});

app.use("/auth", AuthRouter);
app.use("/folder",FolderRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Application is running on: http://localhost:${PORT}`);
});
