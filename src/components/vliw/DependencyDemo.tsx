import { useState } from "react";

interface Instruction {
  id: string;
  op: string;
  dest: string;
  src1: string;
  src2: string;
  description: string;
}

interface DependencySet {
  title: string;
  description: string;
  canPack: boolean;
  reason: string;
  instructions: Instruction[];
  highlight?: { type: "RAW" | "WAW" | "WAR"; from: string; to: string; register: string };
}

const examples: DependencySet[] = [
  {
    title: "Independent Operations",
    description: "No shared registers between operations",
    canPack: true,
    reason: "Different source and destination registers - no conflicts",
    instructions: [
      { id: "a", op: "+", dest: "r0", src1: "r1", src2: "r2", description: "r0 = r1 + r2" },
      { id: "b", op: "*", dest: "r3", src1: "r4", src2: "r5", description: "r3 = r4 × r5" },
      { id: "c", op: "^", dest: "r6", src1: "r7", src2: "r8", description: "r6 = r7 ⊕ r8" },
    ],
  },
  {
    title: "Read-After-Write (RAW)",
    description: "Second op reads what first op writes",
    canPack: false,
    reason: "Op B reads r0, but Op A writes to r0 in the same cycle. B would read the OLD value!",
    instructions: [
      { id: "a", op: "+", dest: "r0", src1: "r1", src2: "r2", description: "r0 = r1 + r2" },
      { id: "b", op: "*", dest: "r3", src1: "r0", src2: "r4", description: "r3 = r0 × r4" },
    ],
    highlight: { type: "RAW", from: "a", to: "b", register: "r0" },
  },
  {
    title: "Write-After-Write (WAW)",
    description: "Both ops write to same register",
    canPack: false,
    reason: "Both ops write to r0. Which value survives? Undefined behavior!",
    instructions: [
      { id: "a", op: "+", dest: "r0", src1: "r1", src2: "r2", description: "r0 = r1 + r2" },
      { id: "b", op: "*", dest: "r0", src1: "r3", src2: "r4", description: "r0 = r3 × r4" },
    ],
    highlight: { type: "WAW", from: "a", to: "b", register: "r0" },
  },
  {
    title: "Write-After-Read (WAR)",
    description: "Second op overwrites what first op reads",
    canPack: false,
    reason: "Op A reads r3, but Op B writes to r3. Which r3 does A see?",
    instructions: [
      { id: "a", op: "+", dest: "r0", src1: "r1", src2: "r3", description: "r0 = r1 + r3" },
      { id: "b", op: "*", dest: "r3", src1: "r4", src2: "r5", description: "r3 = r4 × r5" },
    ],
    highlight: { type: "WAR", from: "b", to: "a", register: "r3" },
  },
];

function InstructionBox({ 
  instruction, 
  isHighlightDest,
  isHighlightSrc,
  highlightColor,
}: { 
  instruction: Instruction;
  isHighlightDest?: boolean;
  isHighlightSrc?: boolean;
  highlightColor?: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-[var(--bg)] rounded font-mono text-sm">
      <span className="text-[var(--text-faint)] w-6">{instruction.id}:</span>
      <span 
        className={`px-1.5 py-0.5 rounded ${
          isHighlightDest 
            ? `${highlightColor} text-white` 
            : "bg-blue-500/20 text-blue-400"
        }`}
      >
        {instruction.dest}
      </span>
      <span className="text-[var(--text-faint)]">=</span>
      <span 
        className={`px-1.5 py-0.5 rounded ${
          isHighlightSrc && instruction.src1 === instruction.dest?.replace("highlight", "") 
            ? `${highlightColor} text-white`
            : instruction.src1.startsWith("r") ? "bg-green-500/20 text-green-400" : ""
        } ${isHighlightSrc && (instruction.src1 === "r0" || instruction.src1 === "r3") ? `${highlightColor} text-white` : ""}`}
      >
        {instruction.src1}
      </span>
      <span className="text-[var(--text-muted)]">{instruction.op}</span>
      <span 
        className={`px-1.5 py-0.5 rounded ${
          instruction.src2.startsWith("r") ? "bg-green-500/20 text-green-400" : ""
        } ${isHighlightSrc && (instruction.src2 === "r0" || instruction.src2 === "r3") ? `${highlightColor} text-white` : ""}`}
      >
        {instruction.src2}
      </span>
    </div>
  );
}

export default function DependencyDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = examples[selectedIndex];

  const highlightColor = selected.highlight?.type === "RAW" 
    ? "bg-red-500" 
    : selected.highlight?.type === "WAW" 
    ? "bg-orange-500" 
    : "bg-yellow-500";

  return (
    <div className="not-prose my-8">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="bg-[var(--bg-paper)] border-b border-[var(--border)] p-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Data Dependencies
          </h4>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Why some operations cannot execute in the same cycle
          </p>
        </div>

        {/* Example selector */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-[var(--border)]">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                i === selectedIndex
                  ? ex.canPack 
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {ex.title}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Description */}
          <p className="text-sm text-[var(--text-muted)] mb-4">{selected.description}</p>

          {/* Instructions */}
          <div className="space-y-2 mb-4">
            {selected.instructions.map((inst) => {
              const isDestHighlighted = selected.highlight && 
                ((selected.highlight.type === "RAW" && inst.id === selected.highlight.from && inst.dest === selected.highlight.register) ||
                 (selected.highlight.type === "WAW" && inst.dest === selected.highlight.register) ||
                 (selected.highlight.type === "WAR" && inst.id === selected.highlight.from && inst.dest === selected.highlight.register));
              
              const isSrcHighlighted = selected.highlight &&
                ((selected.highlight.type === "RAW" && inst.id === selected.highlight.to && (inst.src1 === selected.highlight.register || inst.src2 === selected.highlight.register)) ||
                 (selected.highlight.type === "WAR" && inst.id === selected.highlight.to && (inst.src1 === selected.highlight.register || inst.src2 === selected.highlight.register)));

              return (
                <InstructionBox 
                  key={inst.id} 
                  instruction={inst}
                  isHighlightDest={isDestHighlighted}
                  isHighlightSrc={isSrcHighlighted}
                  highlightColor={highlightColor}
                />
              );
            })}
          </div>

          {/* Result */}
          <div className={`p-4 rounded-lg ${
            selected.canPack 
              ? "bg-green-500/10 border border-green-500/30" 
              : "bg-red-500/10 border border-red-500/30"
          }`}>
            <div className="flex items-start gap-3">
              <span className={`text-lg ${selected.canPack ? "text-green-400" : "text-red-400"}`}>
                {selected.canPack ? "✓" : "✗"}
              </span>
              <div>
                <p className={`font-mono text-sm ${selected.canPack ? "text-green-400" : "text-red-400"}`}>
                  {selected.canPack ? "Can be packed into one cycle" : "Must be in separate cycles"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{selected.reason}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[var(--bg-paper)] border-t border-[var(--border)] p-4">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">r0</span>
              <span className="text-[var(--text-faint)]">Destination</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-mono">r1</span>
              <span className="text-[var(--text-faint)]">Source</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-red-500 text-white font-mono">r0</span>
              <span className="text-[var(--text-faint)]">Conflict</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
