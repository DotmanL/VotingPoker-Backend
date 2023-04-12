import { connectDB } from "../src/config/database";
import { connection } from "mongoose";
import { IssueSchema } from "../models/issueSchema";

// Connect to the MongoDB database
connectDB();

// Wait for the database connection to be established
connection.once("open", async () => {
  console.log("Connected to MongoDB");

  // Get all existing documents in the Issue collection
  const issues = await IssueSchema.find();

  // Update each document to include the userId field
  for (const issue of issues) {
    // issue.userId = 'myUserId'; ///add User Id to the issueSchema
    await issue.save();
  }

  console.log("Migration complete");
  process.exit();
});

//run with node ExampleMigration.ts
