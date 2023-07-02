import { IBase } from "./IBase";
import { RoleType } from "./RoleEnum";

export interface IUser extends IBase {
  name: string;
  currentVote?: number;
  currentRoomId?: string;
  votedState?: boolean;
  isConnected?: boolean;
  jiraAccessToken?: string;
  jiraRefreshToken?: string;
  storyPointsField?: string;
  cardColor?: string;
}
