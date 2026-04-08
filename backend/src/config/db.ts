import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
    try {
        const mongoURI = env.NODE_ENV === "production" ? env.MONGO_URI : "mongodb://localhost:27017/geochat";

        const connIns = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${connIns.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
}