export type Point = { x: number; y: number };
export type StrokeTool = "pen" | "eraser";

export type Stroke = {
  type: StrokeTool;
  color: string;
  width: number;
  points: Point[];
  userId: string;
  timestamp: string;
};

export type ReceiveStrokePayload = {
  stroke: Stroke;
  user: { _id: string; username: string };
};
