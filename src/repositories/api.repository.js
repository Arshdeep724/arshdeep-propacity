import { pool } from "../db/connect.js";
import { createError } from "../utils/error.js";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export class ApiRepository {
  constructor() {}

  async getAllUsers() {
    return (await pool.query('Select * from "User"')).rows;
  }

  async findUser(user_name) {
    return (
      await pool.query(`SELECT * from "User" WHERE user_name = ${user_name}`)
    ).rows[0];
  }

  async createUser(user) {
    const { email, first_name, last_name, user_name, password, mobile_number } =
      user;
    const existingUser = await this.findUser(user_name);
    if (existingUser) {
      throw createError(400, "User Already Exists");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return (
      await pool.query(`INSERT INTO "User" (email, first_name, last_name, user_name, password, mobile_number)
    VALUES (
      ${email},
      ${first_name},
      ${last_name},
      ${user_name},
      ${hashedPassword},
      ${mobile_number},
    )
    RETURNING *`)
    ).rows;
  }

  async login(user_name, password) {
    const user = await this.findUser(user_name);
    if (!user) {
      throw createError(401, "User Doesn't Exist");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError(401, "Invalid Password");
    }
    const access_token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refresh_token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    return {
      access_token,
      refresh_token,
    };
  }
}
