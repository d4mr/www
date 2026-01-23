import { useState, useEffect } from "react";

export default function SIMDDemo() {
  const [mode, setMode] = useState<"scalar" | "simd">("scalar");
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const vecA = [3, 1, 4, 1, 5, 9, 2, 6];
  const vecB = [2, 7, 1, 8, 2, 8, 1, 8];
  const result = vecA.map((a, i) => a + vecB[i]);

  const scalarSteps = 8;
  const simdSteps = 1;
  const totalSteps = mode === "scalar" ? scalarSteps : simdSteps;

  // Which elements are "done" at current step
  const doneCount = mode === "scalar" ? step : step > 0 ? 8 : 0;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= totalSteps) {
          setIsRunning(false);
          return s;
        }
        return s + 1;
      });
    }, mode === "scalar" ? 400 : 600);
    return () => clearInterval(interval);
  }, [isRunning, totalSteps, mode]);

  const reset = () => {
    setStep(0);
    setIsRunning(false);
  };

  const switchMode = (newMode: "scalar" | "simd") => {
    setMode(newMode);
    setStep(0);
    setIsRunning(false);
  };

  const Cell = ({ 
    value, 
    active, 
    done,
    dim,
  }: { 
    value: number; 
    active?: boolean; 
    done?: boolean;
    dim?: boolean;
  }) => (
    <div
      className={`w-9 h-9 rounded flex items-center justify-center font-mono text-sm transition-all duration-200 ${
        active
          ? "bg-yellow-500 text-black scale-110 shadow-lg"
          : done
          ? "bg-green-500/20 text-green-400 border border-green-500/50"
          : dim
          ? "bg-[var(--bg)] text-[var(--text-faint)] border border-[var(--border)]"
          : "bg-[var(--bg-paper)] text-[var(--text-muted)] border border-[var(--border)]"
      }`}
    >
      {value}
    </div>
  );

  const currentScalarIndex = mode === "scalar" ? step - 1 : -1;

  return (
    <div className="not-prose my-8">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="bg-[var(--bg-paper)] border-b border-[var(--border)] p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                SIMD: Single Instruction, Multiple Data
              </h4>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {mode === "scalar" ? "One element at a time..." : "All 8 elements at once!"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => switchMode("scalar")}
                className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                  mode === "scalar"
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Scalar
              </button>
              <button
                onClick={() => switchMode("simd")}
                className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                  mode === "simd"
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                SIMD (8-wide)
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Vector A */}
          <div className="flex items-center gap-3">
            <div className="w-8 font-mono text-xs text-[var(--text-faint)]">A</div>
            <div className="flex gap-1">
              {vecA.map((v, i) => (
                <Cell
                  key={i}
                  value={v}
                  active={mode === "scalar" && i === currentScalarIndex}
                  done={i < doneCount}
                  dim={mode === "simd" && step === 0}
                />
              ))}
            </div>
          </div>

          {/* Operator */}
          <div className="flex items-center gap-3">
            <div className="w-8" />
            <div className="flex gap-1">
              {vecA.map((_, i) => (
                <div
                  key={i}
                  className={`w-9 h-6 flex items-center justify-center font-mono text-lg transition-all ${
                    mode === "scalar" && i === currentScalarIndex
                      ? "text-yellow-500"
                      : mode === "simd" && step > 0
                      ? "text-green-400"
                      : i < doneCount
                      ? "text-green-400/50"
                      : "text-[var(--text-faint)]"
                  }`}
                >
                  +
                </div>
              ))}
            </div>
          </div>

          {/* Vector B */}
          <div className="flex items-center gap-3">
            <div className="w-8 font-mono text-xs text-[var(--text-faint)]">B</div>
            <div className="flex gap-1">
              {vecB.map((v, i) => (
                <Cell
                  key={i}
                  value={v}
                  active={mode === "scalar" && i === currentScalarIndex}
                  done={i < doneCount}
                  dim={mode === "simd" && step === 0}
                />
              ))}
            </div>
          </div>

          {/* Equals */}
          <div className="flex items-center gap-3">
            <div className="w-8" />
            <div className="h-px bg-[var(--border)] flex-1 max-w-[328px]" />
          </div>

          {/* Result */}
          <div className="flex items-center gap-3">
            <div className="w-8 font-mono text-xs text-[var(--text-faint)]">R</div>
            <div className="flex gap-1">
              {result.map((v, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded flex items-center justify-center font-mono text-sm transition-all duration-200 ${
                    i < doneCount
                      ? "bg-green-500 text-black"
                      : "bg-[var(--bg)] text-[var(--text-faint)] border border-dashed border-[var(--border)]"
                  }`}
                >
                  {i < doneCount ? v : "?"}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <div className="font-mono text-sm">
              <span className="text-[var(--text-faint)]">Cycles used:</span>{" "}
              <span className={`font-bold ${step > 0 ? (mode === "simd" ? "text-green-400" : "text-[var(--text)]") : ""}`}>
                {step}
              </span>
            </div>
            <div className="font-mono text-sm">
              <span className="text-[var(--text-faint)]">Elements done:</span>{" "}
              <span className="font-bold">{doneCount}/8</span>
            </div>
            {mode === "simd" && step > 0 && (
              <div className="font-mono text-sm text-green-400">
                8x faster!
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-paper)] border-t border-[var(--border)] p-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (step >= totalSteps) reset();
                setIsRunning(!isRunning);
              }}
              className={`px-4 py-1.5 rounded font-mono text-xs transition-all ${
                isRunning
                  ? "bg-orange-500 text-white"
                  : "bg-[var(--accent)] text-[var(--bg)]"
              }`}
            >
              {isRunning ? "Pause" : step >= totalSteps ? "Replay" : "Run"}
            </button>
            <button
              onClick={() => setStep((s) => Math.min(s + 1, totalSteps))}
              disabled={step >= totalSteps || isRunning}
              className="px-3 py-1.5 rounded font-mono text-xs bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 transition-all"
            >
              Step →
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded font-mono text-xs bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
