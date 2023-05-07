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

  // Update each document to include the userId field
  for (const user of users) {
    user.jiraAccessToken = ""; ///add jiraAccessToken field to the userSchema
    await user.save();
  }

  console.log("Migration complete");
  process.exit();
});

// NOTE:
//run with node UserJiraAccessToken.ts, find a way to run this in the terminal without putting it in index
// update packlage .json with the ts node comman for the file
