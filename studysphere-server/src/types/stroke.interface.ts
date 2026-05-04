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
  timestamp: Date;
};
