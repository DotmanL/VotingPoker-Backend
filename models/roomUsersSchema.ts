import mongoose, { Schema, model } from "mongoose";
import { RoleType } from "../interfaces/RoleEnum";
import { IRoomUsers } from "../interfaces/IRoomUsers";

const roomUsersSchema = new Schema(
  {
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
      default: undefined
    },
    activeIssueId: {
      type: String,
      ref: "Issue",
      required: false
    },
    votedState: {
      type: Boolean,
      default: false
    },
    cardColor: {
      type: String,
      default: "#67A3EE"
    },
    role: {
      type: String,
      default: RoleType.Player
    }
  },
  { timestamps: true }
);

const RoomUsersSchema = model<IRoomUsers>("RoomUsers", roomUsersSchema);
export { RoomUsersSchema };
