import redisClient from "../config/redis.js";

let lastID = "0";
while (true) {
  const messages = await redisClient.xRead(
    {
      key: "notifications_stream",
      id: lastID,
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
      console.log("Message received:");
      console.log(message);

      lastID = message.id;
    }
  }
}
