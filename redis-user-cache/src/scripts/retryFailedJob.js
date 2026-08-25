import redisClient from "../config/redis";

const FAILED_QUEUE = "notification_falied_queue";
const QUEUE_NAME = "notification_queue";

const recoverFailedJob = async () => {
  try {
    const jobData = await redisClient.lIndex(FAILED_QUEUE, -1);
    if (!jobData) {
      console.log("No failed jobs found");
      return;
    }
    const job = JSON.parse(jobData);
    console.log("failed Job");
    console.log(job);
    job.attempts = 0;

    await redisClient.lRem(FAILED_QUEUE, 1, jobData);

    await redisClient.rPush(QUEUE_NAME, JSON.stringify(job));

    console.log(`Job ${job.id} moved from DLQ to main queue`);
  } catch (error) {
    console.error("DLQ Recovery Error:", error);
  } finally {
    await redisClient.quit();
  }
};

recoverFailedJob();
