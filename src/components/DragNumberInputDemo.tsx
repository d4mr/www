import { useState, useRef, useEffect, useCallback } from "react";

interface DragNumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function DragNumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  unit = "px",
}: DragNumberInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const labelRef = useRef<HTMLLabelElement>(null);
  
  // Use refs to avoid stale closures in event handlers
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleMouseDown = useCallback(() => {
    labelRef.current?.requestPointerLock();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    let frameId: number | null = null;
    let pendingDelta = 0;

    const handleMouseMove = (e: MouseEvent) => {
      pendingDelta += e.movementX * step;
      
      // Throttle updates to animation frames
      if (frameId === null) {
        frameId = requestAnimationFrame(() => {
          const newValue = Math.min(max, Math.max(min, valueRef.current + pendingDelta));
          valueRef.current = newValue; // Update ref immediately to avoid lag
          onChangeRef.current(newValue);
          pendingDelta = 0;
          frameId = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      setIsDragging(false);
      document.exitPointerLock();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, min, max, step]);

  return (
    <>
      <label
        ref={labelRef}
        onMouseDown={handleMouseDown}
        className={`
          cursor-ew-resize select-none
          font-mono text-sm text-right
          px-2 py-1 rounded
          transition-all duration-150
          ${isDragging 
            ? "font-semibold bg-[var(--accent)] text-[var(--bg)]" 
            : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-paper)]"
          }
        `}
      >
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={Math.round(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="
            w-16 px-2 py-1
            font-mono text-sm
            bg-[var(--bg-paper)] text-[var(--text)]
            border border-[var(--border)] rounded
            focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
          "
        />
        <span className="font-mono text-xs text-[var(--text-muted)]">{unit}</span>
      </div>
    </>
  );
}

export default function DragNumberInputDemo() {
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(150);
  const [padding, setPadding] = useState(16);
  const [borderRadius, setBorderRadius] = useState(8);

  return (
    <div className="not-prose my-8 p-6 bg-[var(--bg-paper)] border border-[var(--border)] rounded-lg">
      <div className="mb-4">
        <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Interactive Demo
        </h4>
        <p className="text-sm text-[var(--text-muted)]">
          Click and drag the labels to adjust values
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Controls */}
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
          <DragNumberInput
            label="Width"
            value={width}
            onChange={setWidth}
            min={50}
            max={400}
          />
          <DragNumberInput
            label="Height"
            value={height}
            onChange={setHeight}
            min={50}
            max={300}
          />
          <DragNumberInput
            label="Padding"
            value={padding}
            onChange={setPadding}
            min={0}
            max={64}
          />
          <DragNumberInput
            label="Radius"
            value={borderRadius}
            onChange={setBorderRadius}
            min={0}
            max={100}
          />
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          {/* Outer box shows padding (teal/green) */}
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              padding: `${padding}px`,
              borderRadius: `${borderRadius}px`,
            }}
            className="bg-[#4d9e8a]"
          >
            {/* Inner box shows content area (accent color) */}
            <div
              style={{
                borderRadius: `${Math.max(0, borderRadius - padding * 0.5)}px`,
              }}
              className="w-full h-full bg-[var(--accent)] flex items-center justify-center"
            >
              <span className="font-mono text-xs text-[var(--bg)] opacity-80">
                {Math.round(width)} x {Math.round(height)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <p className="font-mono text-xs text-[var(--text-faint)]">
          Tip: Hold shift for finer control (in a full implementation)
        </p>
      </div>
    </div>
  );
}
