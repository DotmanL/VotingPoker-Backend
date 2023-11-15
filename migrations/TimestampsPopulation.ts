import { connectDB } from "../src/config/database";
import { connection } from "mongoose";
import { UserSchema } from "../models/userSchema";
import { RoomSchema } from "../models/roomSchema";
import { RoomUsersSchema } from "../models/roomUsersSchema";
import { RoomMessagesSchema } from "../models/roomMessagesSchema";
import { IssueSchema } from "../models/issueSchema";

// Connect to the MongoDB database
connectDB();

// Wait for the database connection to be established
connection.once("open", async () => {
  console.log("Connected to MongoDB");
  const users = await UserSchema.find();
  for (const user of users) {
    //NOTE: can't mutate createdAt except we recreate all the users and this will chnage thier Ids, don't want to do this as it will
    //affect other relationships for a user already and not realy worth it, bad database design from me :)
    user.createdAt = new Date();
    user.updatedAt = new Date();
    await user.save();
  }

  //   const rooms = await RoomSchema.find();
  //   for (const room of rooms) {
  //     room.createdAt = new Date();
  //     room.updatedAt = new Date();
  //     await room.save();
  //   }

  //   const roomUsers = await RoomUsersSchema.find();
  //   for (const roomUser of roomUsers) {
  //     roomUser.createdAt = new Date();
  //     roomUser.updatedAt = new Date();
  //     await roomUser.save();
  //   }

  //   const roomMessages = await RoomMessagesSchema.find();
  //   for (const roomMessage of roomMessages) {
  //     roomMessage.createdAt = new Date();
  //     roomMessage.updatedAt = new Date();
  //     await roomMessage.save();
  //   }

  //   const issues = await IssueSchema.find();
  //   for (const issue of issues) {
  //     issue.createdAt = new Date();
  //     issue.updatedAt = new Date();
  //     await issue.save();
  //   }

  console.log("Migration complete");
  process.exit();
});
