export interface IUser {
  userId: string;
  name: string;
  currentVote?: number;
  currentRoomId?: string;
  votedState?: boolean;
}