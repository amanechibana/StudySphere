export type Point = {
  x: number;
  y: number;
};

export type StrokeTool = "pen" | "eraser";

export type Stroke = {
  type: StrokeTool;
  color: string;
  width: number;
  points: Point[];
  timestamp: string;
};

export type ReceiveStrokeData = {
  stroke: Stroke;
  user: {
    _id: string;
    username: string;
  };
  timestamp: string;
};

export type SendStrokeData = {
  roomId: string;
  stroke: Stroke;
};
