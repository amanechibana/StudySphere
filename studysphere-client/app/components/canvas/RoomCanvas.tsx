"use client";

import { type Dispatch, type SetStateAction, useMemo } from "react";
import { useCanvasDrawing, type Stroke } from "../../hooks/useCanvasDrawing";
import CanvasToolbar from "./CanvasToolbar";

interface Props {
  strokes: Stroke[];
  setStrokes: Dispatch<SetStateAction<Stroke[]>>;
}

function makeCircleCursor(width: number, color: string, isEraser: boolean): string {
  const r = Math.max(width / 2, 3);
  const pad = 2;
  const size = Math.ceil(r * 2 + pad * 2);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  ctx.strokeStyle = isEraser ? "black" : color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const hot = Math.floor(size / 2);
  return `url(${c.toDataURL()}) ${hot} ${hot}, crosshair`;
}

export default function RoomCanvas({ strokes, setStrokes }: Props) {
  const {
    canvasRef,
    tool, setTool,
    color, setColor,
    width, setWidth,
    onPointerDown, onPointerMove, onPointerUp, onPointerLeave,
    undo, canUndo,
  } = useCanvasDrawing(strokes, setStrokes);

  const cursor = useMemo(
    () => makeCircleCursor(width, color, tool === "eraser"),
    [width, color, tool]
  );

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <CanvasToolbar
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        width={width} setWidth={setWidth}
        onUndo={undo}
        canUndo={canUndo}
      />
      <div className="relative flex-1 min-h-0 rounded-xl border border-border overflow-hidden bg-surface-card">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{ cursor, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
        />
      </div>
    </div>
  );
}
