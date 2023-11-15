import { IBase } from "./IBase";

export interface IRoom extends IBase {
  roomId: string;
  name: string;
  votingSystem: number;
  companyName?: string;
}
