import { IBase } from "./IBase";

export interface IUser extends IBase {
  name: string;
  currentVote?: number;
  currentRoomId?: string;
  votedState?: boolean;
  isConnected?: boolean;
}
