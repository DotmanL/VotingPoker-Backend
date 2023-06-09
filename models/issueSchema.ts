import { Schema, model } from "mongoose";
import { IIssue } from "../interfaces/Issues/IIssue";

const issueSchema = new Schema<IIssue>({
  roomId: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: null
  },
  storyPoints: {
    type: Number,
    default: null
  },
  isVoted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  jiraIssueId: {
    type: String,
    default: null
  }
});

const IssueSchema = model<IIssue>("Issue", issueSchema);
export { IssueSchema };
