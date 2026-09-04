import redisClient from "../config/redis.js";

try {
  await redisClient.xGroupCreate(
    "notifications_stream",
    "notification_group",
    "0",
    { MKSTREAM: true }, //YEH BTATA HAI AGAR notifications_stream stream exist nhi krta to create krdo
  );
} catch (err) {
  if (err.message.includes("BUSYGROUP")) {
    console.log("Group already exists.");
  } else {
    console.error("Error creating stream group:", err);
  }
}
