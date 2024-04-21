import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  if (publicRoutes.includes(req.originalUrl)) {
    return next();
  }
  const token = req.header("Authorization").replace("Bearer","").trim();
  if (!token) return res.status(401);
  try {
    const user = jwt.verify(token, "PROPACITY");
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ status: 400, message: "Invalid token" });
  }
}
