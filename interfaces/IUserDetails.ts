import { IUser } from "./IUser";

export interface IUserDetails extends IUser {
  roomId: string;
  votedState?: boolean;
}
