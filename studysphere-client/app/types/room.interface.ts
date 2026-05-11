export interface Room {
    _id: string;
    name: string;
    description: string;
    course: string;
    ownerId: string,
	inviteCode: string,
	isPrivate: boolean,
	capacity: number,
	isArchived: boolean,

	// canvasId: canvas
	
	members: string[],
	createdAt: Date,
	isArchived?: boolean,
	summary?: string,
}