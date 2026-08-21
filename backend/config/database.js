import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

let database;

export async function connectDB() {
    try {
        await client.connect();

        database = client.db(process.env.DB_NAME);

        console.log("✅ MongoDB Connected Successfully");

        return database;
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        console.error(error);
        process.exit(1);
    }
}

export function getDB() {
    return database;
}