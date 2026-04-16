export interface ChatMessage {
    message: string;
    user: {
        _id: string;
        username: string;
    };
    timestamp: string;
}