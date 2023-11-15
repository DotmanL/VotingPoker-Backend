import { IBase } from "./IBase";

export interface IUserMessage {
  userId: string;
  userName: string;
  message: string;
  messageTime: Number;
  iv: string;
}

export interface IRoomMessage extends IBase {
  roomId: string;
  roomName?: string;
  messages: IUserMessage[];
}
