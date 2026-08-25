import express from "express";
import {
  createNotification,
  getNotificationStatus,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/:id", getNotificationStatus);

export default router;
