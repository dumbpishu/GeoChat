import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

const corsOptions = {
    origin: env.NODE_ENV === "production" ? env.CROS_ORIGIN : "http://localhost:5173",
    credentials: true
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.get("/api/health", (_: express.Request, res: express.Response) => {
    res.status(200).json({ success: true, message: "API is healthy" });
})

import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import chatRoutes from "./routes/chat.route";
import locationRoutes from "./routes/location.route";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/locations", locationRoutes);

app.use(errorHandler);

export default app;