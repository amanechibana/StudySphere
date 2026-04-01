export interface User {
    _id: string;
    username: string;
    email: string;
    currentRoomId: string | null;
    userSettingsId?: string;
    createdAt: Date;
}