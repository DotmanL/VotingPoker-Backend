export interface IUserMessage {
  userId: string;
  userName: string;
  message: string;
  iv: string;
}

export interface IRoomMessage {
  roomId: string;
  roomName?: string;
  messages: IUserMessage[];
}
