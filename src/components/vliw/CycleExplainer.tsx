import { useState, useEffect, useMemo } from "react";

interface State {
  mem: (number | null)[];
  regs: { r0: number | null; r1: number | null; r2: number | null };
}

interface Operation {
  op: string;
  desc: string;
  exec: (state: State) => State;
  highlight: { mem?: number[]; reg?: string; write?: boolean };
}

export default function CycleExplainer() {
  const [cycle, setCycle] = useState(-1); // -1 = initial state
  const [isRunning, setIsRunning] = useState(false);

  const initialMem = [7, 3, null, 12, 8, null]; // Two pairs to add
  const initialRegs = { r0: null, r1: null, r2: null };

  const operations: Operation[] = [
    {
      op: "LOAD r0, mem[0]",
      desc: "Load first number into r0",
      exec: (s) => ({ ...s, regs: { ...s.regs, r0: s.mem[0] } }),
      highlight: { mem: [0], reg: "r0" },
    },
    {
      op: "LOAD r1, mem[1]",
      desc: "Load second number into r1",
      exec: (s) => ({ ...s, regs: { ...s.regs, r1: s.mem[1] } }),
      highlight: { mem: [1], reg: "r1" },
    },
    {
      op: "ADD r2, r0, r1",
      desc: "r2 = r0 + r1",
      exec: (s) => ({ ...s, regs: { ...s.regs, r2: (s.regs.r0 ?? 0) + (s.regs.r1 ?? 0) } }),
      highlight: { reg: "r2" },
    },
    {
      op: "STORE mem[2], r2",
      desc: "Write result to memory",
      exec: (s) => {
        const newMem = [...s.mem];
        newMem[2] = s.regs.r2;
        return { ...s, mem: newMem };
      },
      highlight: { mem: [2], reg: "r2", write: true },
    },
    {
      op: "LOAD r0, mem[3]",
      desc: "Load next pair...",
      exec: (s) => ({ ...s, regs: { ...s.regs, r0: s.mem[3] } }),
      highlight: { mem: [3], reg: "r0" },
    },
    {
      op: "LOAD r1, mem[4]",
      desc: "",
      exec: (s) => ({ ...s, regs: { ...s.regs, r1: s.mem[4] } }),
      highlight: { mem: [4], reg: "r1" },
    },
    {
      op: "ADD r2, r0, r1",
      desc: "",
      exec: (s) => ({ ...s, regs: { ...s.regs, r2: (s.regs.r0 ?? 0) + (s.regs.r1 ?? 0) } }),
      highlight: { reg: "r2" },
    },
    {
      op: "STORE mem[5], r2",
      desc: "Done! Two additions in 8 cycles.",
      exec: (s) => {
        const newMem = [...s.mem];
        newMem[5] = s.regs.r2;
        return { ...s, mem: newMem };
      },
      highlight: { mem: [5], reg: "r2", write: true },
    },
  ];

  const totalCycles = operations.length;

  // Compute state at current cycle
  const state = useMemo(() => {
    let s: State = { mem: [...initialMem], regs: { ...initialRegs } };
    for (let i = 0; i <= cycle && i < operations.length; i++) {
      s = operations[i].exec(s);
    }
    return s;
  }, [cycle]);

  const currentOp = cycle >= 0 && cycle < operations.length ? operations[cycle] : null;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCycle((c) => {
        if (c >= totalCycles - 1) {
          setIsRunning(false);
          return c;
        }
        return c + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isRunning, totalCycles]);

  const MemCell = ({ index, value }: { index: number; value: number | null }) => {
    const isHighlighted = currentOp?.highlight.mem?.includes(index);
    const isWrite = isHighlighted && currentOp?.highlight.write;
    const isRead = isHighlighted && !isWrite;

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="font-mono text-[10px] text-[var(--text-faint)]">mem[{index}]</div>
        <div
          className={`w-12 h-10 rounded border-2 flex items-center justify-center font-mono text-sm transition-all ${
            isWrite
              ? "border-green-500 bg-green-500/20 text-green-400"
              : isRead
              ? "border-blue-500 bg-blue-500/20 text-blue-400"
              : "border-[var(--border)] bg-[var(--bg)]"
          }`}
        >
          {value ?? "—"}
        </div>
      </div>
    );
  };

  const Register = ({ name, value }: { name: string; value: number | null }) => {
    const isHighlighted = currentOp?.highlight.reg === name;

    return (
      <div className="flex items-center gap-2">
        <div className="font-mono text-xs text-[var(--text-muted)] w-6">{name}</div>
        <div
          className={`w-14 h-8 rounded border-2 flex items-center justify-center font-mono text-sm transition-all ${
            isHighlighted
              ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
              : "border-[var(--border)] bg-[var(--bg)]"
          }`}
        >
          {value ?? "—"}
        </div>
      </div>
    );
  };

  return (
    <div className="not-prose my-8">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="bg-[var(--bg-paper)] border-b border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                What's a Cycle?
              </h4>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Adding 7+3 and 12+8. Watch the data flow.
              </p>
            </div>
            <div className="font-mono text-2xl font-bold tabular-nums">
              {cycle < 0 ? "—" : cycle + 1}
              <span className="text-[var(--text-faint)] text-base">/{totalCycles}</span>
              <span className="text-[var(--text-faint)] text-xs ml-1">cycles</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Memory */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">
              Memory
            </div>
            <div className="flex gap-2">
              {state.mem.map((val, i) => (
                <MemCell key={i} index={i} value={val} />
              ))}
            </div>
          </div>

          {/* Registers */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">
              Registers
            </div>
            <div className="flex gap-4">
              <Register name="r0" value={state.regs.r0} />
              <Register name="r1" value={state.regs.r1} />
              <Register name="r2" value={state.regs.r2} />
            </div>
          </div>

          {/* Current operation */}
          <div className="bg-[var(--bg)] rounded-lg p-3">
            {currentOp ? (
              <>
                <div className="font-mono text-sm">
                  <span className="text-[var(--text-faint)]">cycle {cycle + 1}:</span>{" "}
                  <span className="text-[var(--text)]">{currentOp.op}</span>
                </div>
                {currentOp.desc && (
                  <div className="text-xs text-[var(--text-muted)] mt-1">{currentOp.desc}</div>
                )}
              </>
            ) : (
              <div className="font-mono text-sm text-[var(--text-muted)]">
                Press Step or Run to begin
              </div>
            )}
          </div>

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
              <div className="w-3 h-3 rounded border-2 border-yellow-500 bg-yellow-500/20" />
              <span className="text-[var(--text-faint)]">register</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-paper)] border-t border-[var(--border)] p-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (cycle >= totalCycles - 1) {
                  setCycle(-1);
                }
                setIsRunning(!isRunning);
              }}
              className={`px-4 py-1.5 rounded font-mono text-xs transition-all ${
                isRunning
                  ? "bg-orange-500 text-white"
                  : "bg-[var(--accent)] text-[var(--bg)]"
              }`}
            >
              {isRunning ? "Pause" : "Run"}
            </button>
            <button
              onClick={() => setCycle((c) => Math.min(c + 1, totalCycles - 1))}
              disabled={cycle >= totalCycles - 1}
              className="px-3 py-1.5 rounded font-mono text-xs bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 transition-all"
            >
              Step →
            </button>
            <button
              onClick={() => {
                setCycle(-1);
                setIsRunning(false);
              }}
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
