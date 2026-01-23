import { useState, useEffect } from "react";

const WALKER_POSITIONS = [5, 12, 3, 7, 0, 9, 2, 11];
const TREE_SIZE = 15; // Show first 15 nodes for visualization

export default function GatherBottleneckDemo() {
  const [cycle, setCycle] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // 2 loads per cycle, so 4 cycles for 8 loads
  const loadsPerCycle = 2;
  const totalCycles = Math.ceil(WALKER_POSITIONS.length / loadsPerCycle);

  // Which walkers have been loaded by current cycle
  const loadedCount = Math.min(cycle * loadsPerCycle, WALKER_POSITIONS.length);
  const currentlyLoading = cycle > 0 && cycle <= totalCycles
    ? WALKER_POSITIONS.slice((cycle - 1) * loadsPerCycle, cycle * loadsPerCycle)
    : [];
  const alreadyLoaded = WALKER_POSITIONS.slice(0, Math.max(0, (cycle - 1) * loadsPerCycle));

  useEffect(() => {
    if (!isRunning) return;
    if (cycle > totalCycles) {
      setIsRunning(false);
      return;
    }
    const timer = setTimeout(() => setCycle(c => c + 1), 800);
    return () => clearTimeout(timer);
  }, [isRunning, cycle, totalCycles]);

  const reset = () => {
    setCycle(0);
    setIsRunning(false);
  };

  const isDone = cycle > totalCycles;

  return (
    <div className="not-prose my-8">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--bg-paper)] border-b border-[var(--border)] p-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
            The Gather Bottleneck
          </h4>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            8 walkers at scattered positions. No vgather instruction. Only 2 loads/cycle.
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Walker positions */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">
              Walker Tree Positions
            </div>
            <div className="flex gap-2">
              {WALKER_POSITIONS.map((pos, i) => {
                const isLoading = currentlyLoading.includes(pos) && WALKER_POSITIONS.indexOf(pos) === i;
                const isLoaded = alreadyLoaded.includes(pos) && WALKER_POSITIONS.slice(0, alreadyLoaded.length).includes(pos) && i < alreadyLoaded.length;
                const isActuallyLoaded = i < loadedCount && cycle > 0;
                const isActuallyLoading = i >= (cycle - 1) * loadsPerCycle && i < cycle * loadsPerCycle && cycle > 0 && cycle <= totalCycles;

                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="font-mono text-[10px] text-[var(--text-faint)]">w{i}</div>
                    <div
                      className={`w-10 h-10 rounded border-2 flex items-center justify-center font-mono text-sm transition-all duration-300 ${
                        isActuallyLoading
                          ? "border-yellow-500 bg-yellow-500/20 text-yellow-400 scale-110"
                          : isActuallyLoaded
                          ? "border-green-500 bg-green-500/20 text-green-400"
                          : "border-[var(--border)] bg-[var(--bg)]"
                      }`}
                    >
                      {pos}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Memory (tree array) */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">
              Tree Array in Memory
            </div>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: TREE_SIZE }, (_, i) => {
                const isTarget = WALKER_POSITIONS.includes(i);
                const isLoading = currentlyLoading.includes(i);
                const isLoaded = cycle > 0 && WALKER_POSITIONS.slice(0, loadedCount).includes(i) && !isLoading;

                return (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-xs transition-all duration-300 ${
                      isLoading
                        ? "border-yellow-500 bg-yellow-500/30 text-yellow-400 scale-110"
                        : isLoaded
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : isTarget
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                        : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-faint)]"
                    }`}
                  >
                    {i}
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-[var(--text-faint)] mt-1">
              Blue = need to load, Yellow = loading now, Green = loaded
            </div>
          </div>

          {/* Cycle counter and status */}
          <div className="flex items-center justify-between bg-[var(--bg)] rounded-lg p-3">
            <div>
              <div className="font-mono text-2xl font-bold">
                {cycle === 0 ? "—" : Math.min(cycle, totalCycles)}
                <span className="text-base text-[var(--text-faint)]">/{totalCycles}</span>
                <span className="text-sm text-[var(--text-faint)] ml-1">cycles</span>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {cycle === 0
                  ? "Press Run to start loading"
                  : cycle <= totalCycles
                  ? `Loading tree[${currentlyLoading.join("] and tree[")}]...`
                  : "All 8 values loaded!"}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg">
                {loadedCount}<span className="text-[var(--text-faint)]">/8</span>
              </div>
              <div className="text-[10px] text-[var(--text-faint)]">values loaded</div>
            </div>
          </div>

          {/* The punchline */}
          {isDone && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <p className="font-mono text-sm text-orange-400">
                4 cycles just to fetch data. Haven't even started hashing yet.
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                With a gather instruction, this would be 1 cycle. But this machine doesn't have one.
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-500/10" />
              <span className="text-[var(--text-faint)]">need to load</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-yellow-500 bg-yellow-500/20" />
              <span className="text-[var(--text-faint)]">loading</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/20" />
              <span className="text-[var(--text-faint)]">loaded</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[var(--bg-paper)] border-t border-[var(--border)] p-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (isDone) reset();
                setIsRunning(!isRunning);
              }}
              className={`px-4 py-1.5 rounded font-mono text-xs transition-all ${
                isRunning
                  ? "bg-orange-500 text-white"
                  : "bg-[var(--accent)] text-[var(--bg)]"
              }`}
            >
              {isRunning ? "Pause" : isDone ? "Run Again" : "Run"}
            </button>
            <button
              onClick={() => {
                if (cycle <= totalCycles) setCycle(c => c + 1);
              }}
              disabled={isRunning || isDone}
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
