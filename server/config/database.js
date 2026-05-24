import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            dbName: "prep-forge",
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`DB Connection Failed: ${err.message}`);
        process.exit(1); // stop the server if DB fails
    }
};

export default connectDB;