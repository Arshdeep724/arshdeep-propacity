import { Router } from "express";
import { ApiRepository } from "../repositories/api.repository.js";

export const AuthRouter = Router();
const apiRepository = new ApiRepository();

AuthRouter.post("/register", async (req, res) => {
  const user = await apiRepository.createUser(req.body);
  res.send(user);
});

AuthRouter.post("/login", async (req, res) => {
  const { user_name, password } = await req.body;
  return apiRepository.login(user_name,password);
});
