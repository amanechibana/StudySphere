"use client";

import type { Dispatch, SetStateAction } from "react";
import type { StrokeTool } from "../../hooks/useCanvasDrawing";

const COLORS: { label: string; value: string }[] = [
  { label: "Espresso", value: "#2a1f0d" },
  { label: "Caramel", value: "#8b6840" },
  { label: "Slate", value: "#475569" },
  { label: "Red", value: "#dc2626" },
  { label: "Blue", value: "#2563eb" },
  { label: "Green", value: "#16a34a" },
];

const SIZES = [
  { label: "S", value: 3 },
  { label: "M", value: 8 },
  { label: "L", value: 20 },
];

type Props = {
  tool: StrokeTool;
  setTool: Dispatch<SetStateAction<StrokeTool>>;
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
  width: number;
  setWidth: Dispatch<SetStateAction<number>>;
  onUndo: () => void;
  canUndo: boolean;
};

export default function CanvasToolbar({
  tool, setTool,
  color, setColor,
  width, setWidth,
  onUndo, canUndo,
}: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-card border border-border rounded-xl flex-wrap">
      <div className="flex items-center gap-1 bg-background rounded-lg p-1">
        {(["pen", "eraser"] as StrokeTool[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTool(t)}
            className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
              tool === t
                ? "bg-espresso text-[#faf8f3]"
                : "text-espresso-muted hover:text-espresso"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-border" />

      {tool === "pen" && (
        <>
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                title={c.label}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.value,
                  borderColor: color === c.value ? "#2a1f0d" : "transparent",
                  transform: color === c.value ? "scale(1.15)" : undefined,
                }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-5 h-5 rounded-full border-0 cursor-pointer bg-transparent p-0"
            />
          </div>

          <div className="h-5 w-px bg-border" />
        </>
      )}

      <div className="flex items-center gap-1">
        {SIZES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setWidth(s.value)}
            className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${
              width === s.value
                ? "bg-espresso text-[#faf8f3]"
                : "text-espresso-muted hover:bg-background"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="px-3 py-1 rounded-md text-sm font-medium text-espresso-muted hover:text-espresso hover:bg-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Undo
      </button>
    </div>
  );
}
