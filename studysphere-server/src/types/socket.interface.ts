export interface SendMessageData {
  roomId: string;
  message: string;
  user: {
    _id: string;
    username: string;
  };
}

export interface ReceiveMessageData {
  message: string;
  user: {
    _id: string;
    username: string;
  };
  timestamp: string;
}
