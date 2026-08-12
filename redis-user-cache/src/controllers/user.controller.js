import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";

export const getAllUsers = async (req, res) => {
  try {
    const cacheKey = "users:all";
    const cachedUsers = await redisClient.get(cacheKey);

    if (cachedUsers) {
      console.log("Returning users from cache");
      return res.json({ source: "redis", data: JSON.parse(cachedUsers) });
    }

    console.log("Cache Miss");
    const users = await prisma.user.findMany();

    await redisClient.set(cacheKey, JSON.stringify(users), {
      EX: 60,
    });

    return res.json({ source: "postgresql", data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    // Invalidate the cache for all users when a new user is created
    await redisClient.del("users:all");
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};
