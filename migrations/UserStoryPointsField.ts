import { connectDB } from "../src/config/database";
import { connection } from "mongoose";
import { UserSchema } from "../models/userSchema";

// Connect to the MongoDB database
connectDB();

// Wait for the database connection to be established
connection.once("open", async () => {
  console.log("Connected to MongoDB");

  // Get all existing documents in the Issue collection
  const users = await UserSchema.find();

  for (const user of users) {
    user.storyPointsField = ""; ///add storyPointsField field to the userSchema
    await user.save();
  }

  console.log("Migration complete");
  process.exit();
});

// NOTE:
