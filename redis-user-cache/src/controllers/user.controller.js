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

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `user:${id}`;
    const cachedUser = await redisClient.hGetAll(cacheKey);
    if (Object.keys(cachedUser).length > 0) {
      console.log("CACHE HIT");
      return res.status(200).json({
        source: "redis",
        user: cachedUser,
      });
    }
    console.log("CACHE MISS");
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    await redisClient.hSet(cacheKey, {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    });
    await redisClient.expire(cacheKey, 60);
    return res.status(200).json({
      source: "database",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name,
        email,
      },
    });
    await redisClient.del(`user:${id}`);
    console.log("User cache invalidated");

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
