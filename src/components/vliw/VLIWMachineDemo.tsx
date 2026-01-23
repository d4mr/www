import { useState, useEffect, useMemo } from "react";

interface Registers {
  r0: number | null;
  r1: number | null;
  r2: number | null;
  r3: number | null;
}

interface Instruction {
  engine: "LOAD" | "ALU";
  op: string;
  desc: string;
  exec: (regs: Registers) => Registers;
  reads: (keyof Registers)[];
  writes: keyof Registers;
}

interface CycleOps {
  ops: Instruction[];
  desc: string;
}

// The computation: load two constants, add them, then multiply by another constant
// r0 = 7, r1 = 3, r2 = r0 + r1 = 10, r3 = r2 * 2 = 20

const instructions: Instruction[] = [
  {
    engine: "LOAD",
    op: "r0 ← 7",
    desc: "Load constant 7",
    exec: (r) => ({ ...r, r0: 7 }),
    reads: [],
    writes: "r0",
  },
  {
    engine: "LOAD",
    op: "r1 ← 3",
    desc: "Load constant 3",
    exec: (r) => ({ ...r, r1: 3 }),
    reads: [],
    writes: "r1",
  },
  {
    engine: "LOAD",
    op: "r3 ← 2",
    desc: "Load constant 2",
    exec: (r) => ({ ...r, r3: 2 }),
    reads: [],
    writes: "r3",
  },
  {
    engine: "ALU",
    op: "r2 ← r0 + r1",
    desc: "Add r0 + r1",
    exec: (r) => ({ ...r, r2: (r.r0 ?? 0) + (r.r1 ?? 0) }),
    reads: ["r0", "r1"],
    writes: "r2",
  },
  {
    engine: "ALU",
    op: "r2 ← r2 × r3",
    desc: "Multiply by 2",
    exec: (r) => ({ ...r, r2: (r.r2 ?? 0) * (r.r3 ?? 0) }),
    reads: ["r2", "r3"],
    writes: "r2",
  },
];

// Naive: one instruction per cycle
const naiveCycles: CycleOps[] = [
  { ops: [instructions[0]], desc: "Load 7 into r0" },
  { ops: [instructions[1]], desc: "Load 3 into r1" },
  { ops: [instructions[2]], desc: "Load 2 into r3" },
  { ops: [instructions[3]], desc: "Compute r0 + r1" },
  { ops: [instructions[4]], desc: "Multiply result by r3" },
];

// Packed: parallel where possible (LOADs can parallel, then ADD, then MUL)
const packedCycles: CycleOps[] = [
  {
    ops: [instructions[0], instructions[1], instructions[2]],
    desc: "Load all 3 constants in parallel (LOAD engine has 2 slots, but let's say 3)",
  },
  { ops: [instructions[3]], desc: "Compute r0 + r1 (depends on loads)" },
  { ops: [instructions[4]], desc: "Multiply result (depends on add)" },
];

const initialRegs: Registers = { r0: null, r1: null, r2: null, r3: null };

function Register({
  name,
  value,
  isRead,
  isWrite,
}: {
  name: string;
  value: number | null;
  isRead: boolean;
  isWrite: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="font-mono text-[10px] text-[var(--text-faint)]">{name}</div>
      <div
        className={`w-12 h-10 rounded border-2 flex items-center justify-center font-mono text-sm transition-all duration-300 ${
          isWrite
            ? "border-green-500 bg-green-500/20 text-green-400 scale-110"
            : isRead
            ? "border-blue-500 bg-blue-500/20 text-blue-400"
            : "border-[var(--border)] bg-[var(--bg)]"
        }`}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

function InstructionBadge({ instr, isActive }: { instr: Instruction; isActive: boolean }) {
  const engineColors = {
    LOAD: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
    ALU: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  };

  return (
    <div
      className={`px-2 py-1 rounded border font-mono text-xs transition-all ${
        isActive ? engineColors[instr.engine] : "border-[var(--border)] bg-[var(--bg)] opacity-40"
      }`}
    >
      <span className="opacity-60 mr-1">{instr.engine}</span>
      {instr.op}
    </div>
  );
}

function CycleDisplay({
  cycleOps,
  cycleNum,
  currentReads,
  currentWrites,
}: {
  cycleOps: CycleOps;
  cycleNum: number;
  currentReads: Set<string>;
  currentWrites: Set<string>;
}) {
  return (
    <div className="bg-[var(--bg)] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-[var(--text-faint)]">Cycle {cycleNum}</span>
        <span className="text-xs text-[var(--text-muted)]">{cycleOps.desc}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {cycleOps.ops.map((op, i) => (
          <InstructionBadge key={i} instr={op} isActive={true} />
        ))}
      </div>
    </div>
  );
}

export default function VLIWMachineDemo() {
  const [mode, setMode] = useState<"naive" | "packed">("naive");
  const [cycleIndex, setCycleIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  const cycles = mode === "naive" ? naiveCycles : packedCycles;
  const totalCycles = cycles.length;

  // Compute register state at current cycle
  const { regs, currentReads, currentWrites } = useMemo(() => {
    let r = { ...initialRegs };
    let reads = new Set<string>();
    let writes = new Set<string>();

    for (let i = 0; i <= cycleIndex && i < cycles.length; i++) {
      const cycleOps = cycles[i];
      // Execute all ops in this cycle
      for (const op of cycleOps.ops) {
        r = op.exec(r);
        if (i === cycleIndex) {
          op.reads.forEach((reg) => reads.add(reg));
          writes.add(op.writes);
        }
      }
    }
    return { regs: r, currentReads: reads, currentWrites: writes };
  }, [cycleIndex, cycles]);

  // Auto-run effect
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCycleIndex((c) => {
        if (c >= totalCycles - 1) {
          setIsRunning(false);
          return c;
        }
        return c + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, totalCycles]);

  const handleModeChange = (newMode: "naive" | "packed") => {
    setMode(newMode);
    setCycleIndex(-1);
    setIsRunning(false);
  };

  const handleReset = () => {
    setCycleIndex(-1);
    setIsRunning(false);
  };

  const naiveTotal = naiveCycles.length;
  const packedTotal = packedCycles.length;
  const speedup = (naiveTotal / packedTotal).toFixed(1);

  return (
    <div className="not-prose my-8">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--bg-paper)] border-b border-[var(--border)] p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                VLIW Packing Demo
              </h4>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Compute: 7 + 3 = 10, then 10 × 2 = 20
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange("naive")}
                className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                  mode === "naive"
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Naive ({naiveTotal} cycles)
              </button>
              <button
                onClick={() => handleModeChange("packed")}
                className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                  mode === "packed"
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Packed ({packedTotal} cycles)
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Registers */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">
              Registers
            </div>
            <div className="flex gap-3">
              {(["r0", "r1", "r2", "r3"] as const).map((name) => (
                <Register
                  key={name}
                  name={name}
                  value={regs[name]}
                  isRead={currentReads.has(name)}
                  isWrite={currentWrites.has(name)}
                />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">
              Execution Timeline
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {cycles.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCycleIndex(i);
                    setIsRunning(false);
                  }}
                  className={`flex-shrink-0 px-3 py-2 rounded border font-mono text-xs transition-all ${
                    i === cycleIndex
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : i < cycleIndex
                      ? "border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)]"
                      : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-faint)] opacity-50"
                  }`}
                >
                  <div>C{i + 1}</div>
                  <div className="text-[10px] opacity-60">{c.ops.length} ops</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current cycle info */}
          {cycleIndex >= 0 && cycleIndex < cycles.length ? (
            <CycleDisplay
              cycleOps={cycles[cycleIndex]}
              cycleNum={cycleIndex + 1}
              currentReads={currentReads}
              currentWrites={currentWrites}
            />
          ) : (
            <div className="bg-[var(--bg)] rounded-lg p-3">
              <div className="font-mono text-sm text-[var(--text-muted)]">
                Press Run or Step to begin execution
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-500/20" />
              <span className="text-[var(--text-faint)]">read</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/20" />
              <span className="text-[var(--text-faint)]">write</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="px-1.5 py-0.5 rounded border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 text-[8px]">
                LOAD
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="px-1.5 py-0.5 rounded border border-blue-500/50 bg-blue-500/20 text-blue-400 text-[8px]">
                ALU
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[var(--bg-paper)] border-t border-[var(--border)] p-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (cycleIndex >= totalCycles - 1) {
                  setCycleIndex(-1);
                }
                setIsRunning(!isRunning);
              }}
              className={`px-4 py-1.5 rounded font-mono text-xs transition-all ${
                isRunning ? "bg-orange-500 text-white" : "bg-[var(--accent)] text-[var(--bg)]"
              }`}
            >
              {isRunning ? "Pause" : "Run"}
            </button>
            <button
              onClick={() => {
                setCycleIndex((c) => Math.min(c + 1, totalCycles - 1));
                setIsRunning(false);
              }}
              disabled={cycleIndex >= totalCycles - 1}
              className="px-3 py-1.5 rounded font-mono text-xs bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 transition-all"
            >
              Step →
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded font-mono text-xs bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Comparison callout - only show when finished in packed mode */}
      {mode === "packed" && cycleIndex >= totalCycles - 1 && (
        <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-start gap-3">
            <span className="text-green-800 dark:text-green-400 text-lg">↓</span>
            <div>
              <p className="font-mono text-sm text-green-800 dark:text-green-400">
                {naiveTotal} cycles → {packedTotal} cycles = {speedup}× faster
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Same result, fewer cycles. VLIW lets us run independent operations in parallel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
