import redisClient from "../config/redis.js";

const GROUP_NAME = "notification_workers";
const CONSUMER_NAME = "worker_1";
const STREAM_KEY = "notifications_stream";

while (true) {
  try {
    const messages = await redisClient.xReadGroup(
      GROUP_NAME,
      CONSUMER_NAME,
      {
        key: STREAM_KEY,
        id: ">",
      },
      {
        COUNT: 10,
        BLOCK: 5000,
      },
    );

    if (!messages) {
      console.log("No new messages, waiting...");
      continue;
    }

    for (const stream of messages) {
      for (const message of stream.messages) {
        try {
          console.log("Message received:");
          console.log(message);

          console.log("Processing message...");

          await redisClient.xAck(STREAM_KEY, GROUP_NAME, message.id);

          console.log(`Acknowledged message with ID: ${message.id}`);
        } catch (err) {
          console.error("Error reading from stream:", err);
        }
      }
    }
  } catch (err) {
    console.error("Error reading from stream:", err);
  }
}
