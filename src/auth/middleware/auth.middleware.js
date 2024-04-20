import * as jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401);
  try {
    const user = jwt.verify(token, "your-secret-key");
    console.log(user);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
