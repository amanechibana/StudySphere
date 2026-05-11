import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Point, Stroke, StrokeTool } from "../types/stroke.interface";

export type { Point, StrokeTool, Stroke } from "../types/stroke.interface";

const MIN_DISTANCE = 4;

function removeLastOwn(strokes: Stroke[], userId: string | undefined): Stroke[] {
  if (!userId) return strokes;
  const idx = [...strokes].reverse().findIndex((s) => s.userId === userId);
  if (idx === -1) return strokes;
  const target = strokes.length - 1 - idx;
  return strokes.filter((_, i) => i !== target);
}

function dist(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const { points } = stroke;
  if (points.length < 2) return;
  ctx.save();
  ctx.globalCompositeOperation =
    stroke.type === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = stroke.type === "eraser" ? "rgba(0,0,0,1)" : stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const m = midpoint(points[i], points[i + 1]);
    ctx.quadraticCurveTo(points[i].x, points[i].y, m.x, m.y);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
}

function redraw(
  ctx: CanvasRenderingContext2D,
  committed: Stroke[],
  live?: Stroke | null
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const s of committed) drawStroke(ctx, s);
  if (live && live.points.length >= 2) drawStroke(ctx, live);
}

export function useCanvasDrawing(
  strokes: Stroke[],
  setStrokes: Dispatch<SetStateAction<Stroke[]>>,
  userId: string | undefined,
  onCommit?: (stroke: Stroke) => void,
  onUndo?: () => void
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<StrokeTool>("pen");
  const [color, setColor] = useState("#2a1f0d");
  const [width, setWidth] = useState(3);

  const strokesRef = useRef<Stroke[]>([]);
  const isDrawing = useRef(false);
  const currentStroke = useRef<Stroke | null>(null);

  useEffect(() => { strokesRef.current = strokes; }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      if (w === 0 || h === 0) return;
      canvas.width = Math.floor(w);
      canvas.height = Math.floor(h);
      const ctx = canvas.getContext("2d");
      if (ctx) redraw(ctx, strokesRef.current);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) redraw(ctx, strokes);
  }, [strokes]);

  useEffect(() => {
    // undo shortcut: Ctrl+Z or Cmd+Z
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        setStrokes((prev) => removeLastOwn(prev, userId));
        onUndo?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setStrokes, onUndo]);

  function getPoint(e: PointerEvent<HTMLCanvasElement>): Point {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    currentStroke.current = {
      type: tool,
      color,
      width,
      points: [getPoint(e)],
      userId: userId ?? "",
      timestamp: new Date().toISOString(),
    };
  }

  function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !currentStroke.current) return;
    const point = getPoint(e);
    const pts = currentStroke.current.points;
    if (dist(pts[pts.length - 1], point) < MIN_DISTANCE) return;
    pts.push(point);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) redraw(ctx, strokesRef.current, currentStroke.current);
  }

  function commitStroke() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const stroke = currentStroke.current;
    currentStroke.current = null;
    if (!stroke || stroke.points.length < 2) return;
    setStrokes((prev) => [...prev, stroke]);
    onCommit?.(stroke);
  }

  return {
    canvasRef,
    tool, setTool,
    color, setColor,
    width, setWidth,
    onPointerDown,
    onPointerMove,
    onPointerUp: commitStroke,
    onPointerLeave: commitStroke,
    undo: () => {
      setStrokes((prev) => removeLastOwn(prev, userId));
      onUndo?.();
    },
    canUndo: strokes.some((s) => s.userId === userId),
  };
}
