import { Router } from "express";
import { ApiRepository } from "../repositories/api.repository.js";
import multer from "multer";

export const FolderRouter = Router();
const apiRepository = new ApiRepository();
const upload = multer();

FolderRouter.post("/", async (req, res) => {
  try {
    console.log(req.user);
    const name = req.query.name;
    const folder = await apiRepository.createFolder(req.user.userId, name);
    res.status(201).send(folder);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.post("/share", async (req, res) => {
  try {
    const { userId, fileIds, folderIds } = req.body;
    const response = await apiRepository.shareFiles(userId, fileIds, folderIds);
    res.status(201).send(response);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.patch("/file/rename", async (req, res) => {
  try {
    const { fileId, name } = req.query;
    const file = await apiRepository.renameFile(parseInt(fileId), name);
    res.send(file);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.patch("/file/move", async (req, res) => {
  try {
    const { fileId, folderId } = req.query;
    const file = await apiRepository.moveFile(parseInt(fileId), parseInt(folderId));
    res.status(201).send(file);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.delete("/file/:fileId/delete", async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await apiRepository.deleteFile(parseInt(fileId));
    res.send(file);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.post("/:folderId", async (req, res) => {
  try {
    const name = req.query.name;
    const { folderId } = req.params;
    const folder = await apiRepository.createSubFolder(
      req.user.userId,
      name,
      folderId
    );
    res.status(201).send(folder);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.post(
  "/:folderId/file",
  upload.single("file"),
  async (req, res) => {
    try {
      const { folderId } = req.params;
      const file = await apiRepository.uploadFile(req.file, folderId);
      res.status(201).send(file);
    } catch (error) {
      res.status(error.status).send(error);
    }
  }
);

FolderRouter.get("/", async (req, res) => {
  try {
    const name = req.query.name;
    const folders = await apiRepository.searchFolders(name);
    res.send(folders);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.get("/all", async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" } = req.query;
    const folders = await apiRepository.getAllFolders(page,limit,sortBy,sortOrder);
    res.send(folders);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.get("/file", async (req, res) => {
  try {
    const name = req.query.name;
    const files = await apiRepository.searchFiles(name);
    res.send(files);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

FolderRouter.get("/file/all", async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" } = req.query;
    const files = await apiRepository.getAllFiles(page,limit,sortBy,sortOrder);
    res.send(files);
  } catch (error) {
    res.status(error.status).send(error);
  }
});
