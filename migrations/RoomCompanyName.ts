import { RoomSchema } from "../models/roomSchema";
import { connectDB } from "../src/config/database";
import { connection } from "mongoose";

// Connect to the MongoDB database
connectDB();

// Wait for the database connection to be established
connection.once("open", async () => {
  console.log("Connected to MongoDB");

  // Get all existing documents in the Room collection
  const rooms = await RoomSchema.find();

  for (const room of rooms) {
    room.companyName = "BindyStreet"; ///add BindyStreet to all existing rooms
    await room.save();
  }

  console.log("Migration complete");
  process.exit();
});
