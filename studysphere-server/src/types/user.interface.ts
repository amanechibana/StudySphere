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
  createdAt: Date;
}

// user fields for insert — MongoDB DOES NOT assign `_id`, Firebase does
export type NewUser = User;
