import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser";
import { RoleType } from "../interfaces/RoleEnum";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32
      // unique: true
    },
    currentVote: {
      type: Number
    },
    currentRoomId: {
      type: String,
      trim: true
    },
    votedState: {
      type: Boolean,
      default: false
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    jiraAccessToken: {
      type: String
    },
    jiraRefreshToken: {
      type: String
    },
    storyPointsField: {
      type: String
    },
    cardColor: {
      type: String,
      default: "#67A3EE"
    }
  },
  { timestamps: true }
);

const UserSchema = model<IUser>("Users", userSchema);
export { UserSchema };
