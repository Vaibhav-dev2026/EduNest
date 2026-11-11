import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client = null;
let database = null;

export async function connectDB() {
    if (database) {
        return database;
    }

    try {
        if (!client) {
            client = new MongoClient(process.env.MONGODB_URI, {
                maxPoolSize: 50,
                minPoolSize: 5,
                maxIdleTimeMS: 30000,
                connectTimeoutMS: 10000,
                serverSelectionTimeoutMS: 8000,
            });
        }

        await client.connect();
        database = client.db(process.env.DB_NAME);

        console.log("✅ MongoDB Connected Successfully");
        return database;
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        throw error;
    }
}

export function getDB() {
    return database;
}