import { IBase } from "./IBase";
import { RoleType } from "./RoleEnum";

export interface IRoomUsers extends IBase {
  userId: string;
  roomId: string;
  userName: string;
  currentVote?: number;
  activeIssueId?: string;
  votedState?: boolean;
  cardColor?: string;
  role?: RoleType;
  [key: string]: any;
}
