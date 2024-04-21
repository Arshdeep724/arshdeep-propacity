import { pool } from "../db/connect.js";
import { createError } from "../utils/error.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadFileS3 } from "../aws/aws.lib.js";
import { generateRandomString } from "../utils/random-string-generator.js";
import dotenv from "dotenv";
dotenv.config();

export class ApiRepository {
  constructor() {}

  async getAllFolders(page, limit, sortBy, sortOrder) {
    try {
      const offset = (page - 1) * limit;
      return (
        await pool.query(`SELECT * 
        FROM "Folder"
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset};`)
      ).rows;
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async getAllFiles(page, limit, sortBy, sortOrder) {
    try {
      const offset = (page - 1) * limit;
      return (
        await pool.query(`SELECT * 
        FROM "File"
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset};`)
      ).rows;
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async findUser(user_name) {
    return (
      await pool.query(`SELECT * from "User" WHERE user_name = '${user_name}'`)
    ).rows[0];
  }

  async createUser(user) {
    try {
      const {
        email,
        first_name,
        last_name,
        user_name,
        password,
        mobile_number,
      } = user;
      const existingUser = await this.findUser(user_name);
      if (existingUser) {
        throw createError(400, "User Already Exists");
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return (
        await pool.query(
          `INSERT INTO "User" (email, first_name, last_name, user_name, password, mobile_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
          [
            email,
            first_name,
            last_name,
            user_name,
            hashedPassword,
            mobile_number,
          ]
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async login(user_name, password) {
    try {
      const user = await this.findUser(user_name);
      if (!user) {
        throw createError(401, "User Doesn't Exist");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw createError(401, "Invalid Password");
      }
      const access_token = jwt.sign(
        { userId: user.id, user_name: user.user_name },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return {
        access_token,
      };
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async createFolder(userId, name) {
    try {
      return (
        await pool.query(
          `INSERT INTO "Folder" (name, user_id) VALUES ($1, $2) RETURNING *`,
          [generateRandomString(5) + "_" + name, userId]
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async createSubFolder(userId, name, folderId) {
    try {
      return (
        await pool.query(
          `INSERT INTO "Folder" (name, user_id, parent_folder_id) VALUES ($1, $2, $3) RETURNING *`,
          [generateRandomString(5) + "_" + name, userId, parseInt(folderId)]
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async uploadFile(file, folderId) {
    try {
      const location = await uploadFileS3(file);
      return (
        await pool.query(
          `INSERT INTO "File" (name, folder_id, fieldname, originalname, encoding, mimetype, size, location)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            generateRandomString(5) + "_" + file.originalname,
            parseInt(folderId),
            file.filename,
            file.originalname,
            file.encoding,
            file.mimetype,
            parseInt(file.size),
            location,
          ]
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async searchFolders(name) {
    try {
      return (
        await pool.query(
          `SELECT * from "Folder" WHERE name = '${name.toString()}'`
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async searchFiles(name) {
    try {
      return (
        await pool.query(
          `SELECT * from "File" WHERE name = '${name.toString()}'`
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async shareFiles(userId, fileIds, folderIds) {
    try {
      let res = {
        userId,
      };
      if (fileIds.length > 0) {
        const files = (
          await pool.query(
            ` UPDATE "User"
          SET shared_files_ids = shared_files_ids || $1
          WHERE id = $2
          RETURNING id, shared_files_ids
        `,
            [fileIds, userId]
          )
        ).rows[0];
        res.sharedFiles = fileIds;
      }
      if (folderIds.length > 0) {
        const folders = (
          await pool.query(
            ` UPDATE "User"
          SET shared_folder_ids = shared_folder_ids || $1
          WHERE id = $2
          RETURNING id, shared_folder_ids
        `,
            [folderIds, userId]
          )
        ).rows[0];
        res.sharedFolders = folderIds;
      }
      return res;
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async renameFile(fileId, name) {
    try {
      return (
        await pool.query(
          `
          UPDATE "File"
          SET name = $1
          WHERE id = $2
          RETURNING *;
        `,
          [generateRandomString(5) + "_" + name, fileId]
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async deleteFile(fileId) {
    try {
      return (
        await pool.query(
          `DELETE FROM "File"
          WHERE id = $1
          RETURNING *;`,
          [fileId]
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }

  async moveFile(fileId, folderId) {
    try {
      return (
        await pool.query(
          `UPDATE "File"
          SET folder_id = $1
          WHERE id = $2
          RETURNING *`,
          [folderId, fileId]
        )
      ).rows[0];
    } catch (error) {
      throw createError(error.status || 500, error.message);
    }
  }
}
