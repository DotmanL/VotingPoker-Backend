import { IUser } from "./IUser";

export interface IUserDetails extends IUser {
  roomId: string;
  socketId: string;
  votedState?: boolean;
}
