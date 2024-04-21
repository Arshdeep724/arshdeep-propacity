import { Router } from "express";
import { ApiRepository } from "../repositories/api.repository.js";

export const AuthRouter = Router();
const apiRepository = new ApiRepository();

AuthRouter.post("/register", async (req, res) => {
  try {
    const user = await apiRepository.createUser(req.body);
    res.send(user);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

AuthRouter.post("/login", async (req, res) => {
  try {
    const { user_name, password } = req.body;
    const response = await apiRepository.login(user_name,password);
    res.send(response);
  } catch (error) {
    res.status(error.status).send(error);
  }
});
