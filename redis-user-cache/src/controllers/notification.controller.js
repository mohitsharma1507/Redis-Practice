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
      attempts: 0,
      maxAttempts: 3,
    };

    await redisClient.hSet(`notification:status:${job.id}`, {
      status: "PENDING",
      attempts: "0",
      createdAt: job.createdAt,
      updatedAt: job.createdAt,
    });
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

export const getNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await redisClient.hGetAll(`notification.status:${id}`);
    if (Object.keys(status).length === 0) {
      return res.status(404).json({
        message: "Job not Found",
      });
    }
    return res.status(200).json({
      jobId: id,
      status,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
