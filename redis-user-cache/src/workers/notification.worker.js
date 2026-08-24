import redisClient from "../config/redis.js";

const QUEUE_NAME = "notification_queue";
const FAILED_QUEUE = "notification_failed_queue";
const RETRY_QUEUE = "notification_retry_queue";
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

//exponential backoff
const getRetryDelay = (attempt) => {
  return BASE_DELAY * Math.pow(2, attempt - 1);
};

const processNotification = async (job) => {
  console.log("Processing Notification");
  console.log(job);

  if (job.message.includes("fail")) {
    throw new Error("Notification processing failed");
  }

  console.log("Notification Processed Successfully");
};

const moveReadyRetriesToQueue = async () => {
  try {
    const now = Date.now();
    const job = await redisClient.zRangeByScore(RETRY_QUEUE, 0, now);
    for (const job of jobs) {
      await redisClient.zRem(RETRY_QUEUE, job);
      await redisClient.rPush(QUEUE_NAME, job);
      console.log("Retry job moved to main queue");
    }
  } catch (error) {
    console.error("Retry Scheduler Error:", error);
  }
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
        await processNotification(job);
        console.log(`Job ${job.id} completed successfully`);
      } catch (error) {
        console.error(`Job ${job.id} failed`);
        job.attempts++;
        console.log(`Retry attempt: ${job.attempts}/${MAX_RETRIES}`);

        if (job.attempts < MAX_RETRIES) {
          const delay = getRetryDelay(job.attempts);
          const retryAt = Date.now() + delay;

          await redisClient.zAdd(RETRY_QUEUE, {
            score: retryAt,
            value: JSON.stringify(job),
          });
          console.log(`Job scheduled for retry ${delay}ms `);
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

//Retry scheduler
setInterval(moveReadyRetriesToQueue, 500);

startWorker();
