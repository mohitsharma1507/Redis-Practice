import redisClient from "../config/redis.js";
const subscriber = redisClient.duplicate(); //Matlab existing Redis connection ka separate connection bana rahe hain.

await subscriber.connect();
console.log("Subscriber connected to redis");

await subscriber.subscribe("notifications", (message) => {
  console.log("Notification received:");
  console.log(message);
});
