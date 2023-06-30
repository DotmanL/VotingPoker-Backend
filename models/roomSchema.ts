import { Schema, model } from "mongoose";
import { IRoom } from "../interfaces/IRoom";

const roomSchema = new Schema<IRoom>({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  roomId: {
    type: String,
    required: true
  },
  votingSystem: {
    type: Number
  },
  companyName: {
    type: String
  }
});

const RoomSchema = model<IRoom>("Room", roomSchema);
export { RoomSchema };
