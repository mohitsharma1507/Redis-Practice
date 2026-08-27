import redisClient from "../config/redis.js";

const message = {
  id: Date.now(),
  type: "WELCOME",
  message: "Welcome to Redis Pub/Sub",
};

await redisClient.publish("notifications", JSON.stringify(message));

console.log("Notifications published");

await redisClient.quit();
