import { env } from "./config/env";
import { connectDB } from "./config/db";
import app from "./app";

import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./sockets";

const startServer = async () => {
    try {
        await connectDB();
        
        const httpServer = createServer(app);

        const io = new Server(httpServer, {
            cors: {
                origin: env.NODE_ENV === "production" ? env.CROS_ORIGIN : "http://localhost:5173",
                credentials: true
            }
        });

        initializeSocket(io);

        httpServer.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
}

startServer();