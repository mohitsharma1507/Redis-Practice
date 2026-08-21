import redisClient from "../config/redis.js";

const QUEUE_NAME = "notification_queue";
const FAILED_QUEUE = "notification_failed_queue";
const MAX_RETRIES = 3;

const processNotification = async (job) => {
  console.log("Processing Notification");
  console.log(job);

  if (job.message.includes("fail")) {
    throw new Error("Notification processing failed");
  }

  console.log("Notification Processed Successfully");
};

const startWorker = async () => {
  console.log("Notification Worker Started");
  while (true) {
    try {
      const result = await redisClient.brPop(QUEUE_NAME, 0);
      const notification = result.element;
      const job = JSON.parse(notification);

      console.log("Notification received");
      console.log(job);

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Job ${job.id} failed`);
        job.attempts++;
        console.log(`Retry attempt: ${job.attempts}/${MAX_RETRIES}`);

        if (job.attempts < MAX_RETRIES) {
          await redisClient.rPush(QUEUE_NAME, JSON.stringify(job));
          console.log("Job added back to retry queue");
        } else {
          await redisClient.rPush(FAILED_QUEUE, JSON.stringify(job));

          console.log("Job moved to DLQ");
        }
      }
    } catch (error) {
      console.error("Worker Error:", error);
    }
  }
};

startWorker();
