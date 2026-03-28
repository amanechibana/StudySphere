export type UserId = string;

declare global {
    namespace Express {
        interface Request {
            user?: { _id: string };
        }
    }
}

export interface User {
    // TODO
    _id: UserId
}