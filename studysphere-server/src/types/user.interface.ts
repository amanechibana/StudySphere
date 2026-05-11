declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

export type UserId = string;

export interface User {
  _id: UserId;
  username: string;
  email: string | null;
  displayName: string | null;
  bio: string | null;
  createdAt: Date;
}
