import { Document } from "mongoose";

export interface IIssueDocument extends Document {
  roomId: string;
  link: string;
  name: string;
  summary?: string;
  storyPoints?: number;
  order?: number;
  isVoted?: boolean;
}
