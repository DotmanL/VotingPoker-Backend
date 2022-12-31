import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser";

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    trim: true,
    required: true,
    maxlength: 32,
    unique: true
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
  }
});

const UserSchema = model<IUser>("Users", userSchema);
export { UserSchema };
