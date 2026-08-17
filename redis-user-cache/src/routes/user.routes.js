import { Router } from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
const router = Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);

export default router;
