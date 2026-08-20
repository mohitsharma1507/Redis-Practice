import crypto from "crypto";
import redisClient from "../config/redis.js";

export const createNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    if (!userId || !type || !message) {
      return res.status(400).json({
        message: "userId, type and message are required",
      });
    }
    const job = {
      id: crypto.randomUUID(),
      userId,
      type,
      message,
      createdAt: new Date().toISOString(),
    };
    await redisClient.rPush("notification_queue", JSON.stringify(job));

    return res.status(202).json({
      message: "Notification added to queue",
      job,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
