import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/geochat";
        if (!mongoURI) {
            throw new Error("MongoDB URI is not defined in environment variables");
        }
        
        const connIns = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${connIns.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
}