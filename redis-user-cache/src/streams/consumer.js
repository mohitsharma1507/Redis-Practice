import redisClient from "../config/redis.js";

const messages = await redisClient.xRead(
  {
    key: "notifications_stream",
    id: "1788450319950-0",
  },
  {
    COUNT: 10,
  },
);
console.log(JSON.stringify(messages, null, 2));
