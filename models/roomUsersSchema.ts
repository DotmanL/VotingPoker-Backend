import mongoose, { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser";

const roomUsersSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  currentVote: {
    type: Number,
    default: 0
  },
  activeIssueId: {
    type: String,
    ref: "Issue",
    required: false
  },
  votedState: {
    type: Boolean,
    default: false
  }
});

const RoomUsersSchema = model<IUser>("RoomUsers", roomUsersSchema);
export { RoomUsersSchema };
