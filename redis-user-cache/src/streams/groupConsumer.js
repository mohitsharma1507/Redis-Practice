//xReadGroup is a Redis command that allows you to read messages from a stream as part of a consumer group. It enables multiple consumers to read from the same stream while ensuring that each message is processed by only one consumer in the group.

// import redisClient from "../config/redis.js";

// const GROUP_NAME = "notification_workers";
// const CONSUMER_NAME = "worker_1";
// const STREAM_KEY = "notifications_stream";

// while (true) {
//   try {
//     const messages = await redisClient.xReadGroup(
//       GROUP_NAME,
//       CONSUMER_NAME,
//       {
//         key: STREAM_KEY,
//         id: ">",
//       },
//       {
//         COUNT: 10,
//         BLOCK: 5000,
//       },
//     );

//     if (!messages) {
//       console.log("No new messages, waiting...");
//       continue;
//     }

//     for (const stream of messages) {
//       for (const message of stream.messages) {
//         try {
//           console.log("Message received:");
//           console.log(message);

//           console.log("Processing message...");

//           await redisClient.xAck(STREAM_KEY, GROUP_NAME, message.id);

//           console.log(`Acknowledged message with ID: ${message.id}`);
//         } catch (err) {
//           console.error("Error reading from stream:", err);
//         }
//       }
//     }
//   } catch (err) {
//     console.error("Error reading from stream:", err);
//   }
// }

// xAutoClaim is a Redis command that allows you to claim pending messages from a stream for a specific consumer group. It is useful in scenarios where a consumer has crashed or is unable to process messages, allowing another consumer to take over and process those messages.

import redisClient from "../config/redis.js";

const GROUP_NAME = "notification_workers";
const CONSUMER_NAME = "worker_1";
const STREAM_KEY = "notifications_stream";

while (true) {
  try {
    const result = await redisClient.xAutoClaim(
      STREAM_KEY,
      GROUP_NAME,
      CONSUMER_NAME,
      30000,
      "0-0",
      {
        COUNT: 10,
      },
    );

    if (result.messages.length === 0) {
      console.log("No stuck messages...");
      continue;
    }

    for (const message of result.messages) {
      try {
        console.log("Message received:");
        console.log(message);

        console.log("Processing message...");

        await redisClient.xAck(STREAM_KEY, GROUP_NAME, message.id);

        console.log(`Acknowledged message with ID: ${message.id}`);
      } catch (err) {
        console.error("Error processing message:", err);
      }
    }
  } catch (err) {
    console.error("Errors auto-claiming messages:", err);
  }
}
