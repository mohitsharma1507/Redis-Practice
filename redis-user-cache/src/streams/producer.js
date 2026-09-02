import redisClient from "../config/redis.js";
const streamId = await redisClient.xAdd("notifications_stream", "*", {
  type: "WELCOME",
  message: "Hello, World!",
});
console.log(`Message added to stream with ID: ${streamId}`);
