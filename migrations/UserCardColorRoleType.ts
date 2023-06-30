import { connectDB } from "../src/config/database";
import { connection } from "mongoose";
import { UserSchema } from "../models/userSchema";
import { RoleType } from "../interfaces/RoleEnum";

// Connect to the MongoDB database
connectDB();

// Wait for the database connection to be established
connection.once("open", async () => {
  console.log("Connected to MongoDB");

  const users = await UserSchema.find();

  for (const user of users) {
    user.cardColor = "#67A3EE";
    user.role = RoleType.Player;
    await user.save();
  }

  console.log("Migration complete");
  process.exit();
});
