import express from "express";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/api/notification", notificationRoutes);
export default app;
