import { IBase } from "../IBase";

export interface IIssue extends IBase {
  roomId: string;
  link: string;
  name: string;
  summary?: string;
  storyPoints?: number;
  order?: number;
  isVoted?: boolean;
}
