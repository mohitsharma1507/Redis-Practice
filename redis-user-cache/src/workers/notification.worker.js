import redisClient from "../config/redis.js";

const QUEUE_NAME = "notification_queue";

const startWorker = async () => {
  console.log("Notification Worker Started");
  while (true) {
    try {
      const result = await redisClient.brPop(QUEUE_NAME, 0);
      const notification = result.element;
      const job = JSON.parse(notification);
      console.log("Notification received");
      console.log(job);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Notification processed");
      console.log(`User: ${job.userId}`);
      console.log(`Type: ${job.type}`);
      console.log(`Message: ${job.message}`);
    } catch (error) {
      console.error("Worker Error:", error);
    }
  }
};

startWorker();
