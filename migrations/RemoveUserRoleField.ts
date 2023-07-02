import { connectDB } from "../src/config/database";
import { connection } from "mongoose";
import { UserSchema } from "../models/userSchema";

// Connect to the MongoDB database
connectDB();

// Wait for the database connection to be established
connection.once("open", async () => {
  console.log("Connected to MongoDB");

  try {
    await UserSchema.updateMany({}, { $unset: { role: 1 } });
    console.log("Migration complete");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    connection.close();
    process.exit();
  }
});
