interface SlotBarProps {
  name: string;
  count: number;
  maxCount: number;
  color: string;
  description: string;
}

function SlotBar({ name, count, maxCount, color, description }: SlotBarProps) {
  const colorClasses: Record<string, { bg: string; fill: string }> = {
    blue: { bg: "bg-blue-500/20", fill: "bg-blue-500" },
    purple: { bg: "bg-purple-500/20", fill: "bg-purple-500" },
    green: { bg: "bg-green-500/20", fill: "bg-green-500" },
    orange: { bg: "bg-orange-500/20", fill: "bg-orange-500" },
    red: { bg: "bg-red-500/20", fill: "bg-red-500" },
  };

  const { bg, fill } = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 text-right">
        <span className="font-mono text-xs font-bold">{name}</span>
      </div>
      <div className="flex-1">
        <div className={`h-6 rounded ${bg} flex`}>
          {Array.from({ length: maxCount }, (_, i) => (
            <div
              key={i}
              className={`h-full flex-1 ${i < count ? fill : ""} ${
                i > 0 ? "border-l border-[var(--bg)]/50" : ""
              } ${i === 0 ? "rounded-l" : ""} ${i === maxCount - 1 ? "rounded-r" : ""}`}
            />
          ))}
        </div>
      </div>
      <div className="w-8 text-center">
        <span className="font-mono text-xs text-[var(--text-muted)]">{maxCount}</span>
      </div>
      <div className="w-48 hidden md:block">
        <span className="text-xs text-[var(--text-faint)]">{description}</span>
      </div>
    </div>
  );
}

export default function SlotLimitsVisual() {
  const slots = [
    { name: "ALU", count: 12, maxCount: 12, color: "blue", description: "Scalar arithmetic (+, *, ^, <<, etc.)" },
    { name: "VALU", count: 6, maxCount: 6, color: "purple", description: "Vector ops (8 elements each)" },
    { name: "LOAD", count: 2, maxCount: 2, color: "green", description: "Memory reads + constants" },
    { name: "STORE", count: 2, maxCount: 2, color: "orange", description: "Memory writes" },
    { name: "FLOW", count: 1, maxCount: 1, color: "red", description: "Control flow (branch, halt)" },
  ];

  const totalSlots = slots.reduce((sum, s) => sum + s.maxCount, 0);

  return (
    <div className="not-prose my-8">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="bg-[var(--bg-paper)] border-b border-[var(--border)] p-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Slot Limits Per Cycle
          </h4>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Maximum operations the machine can execute in a single cycle
          </p>
        </div>

        <div className="p-4 space-y-3">
          {slots.map((slot) => (
            <SlotBar key={slot.name} {...slot} />
          ))}
        </div>

        <div className="bg-[var(--bg-paper)] border-t border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-muted)]">
              Total capacity per cycle:
            </span>
            <span className="font-mono text-lg font-bold">
              {totalSlots} operations
            </span>
          </div>
          <p className="text-xs text-[var(--text-faint)] mt-2">
            With VALU processing 8 elements each, that's up to <strong>12 + 6×8 = 60</strong> scalar-equivalent operations per cycle.
          </p>
        </div>
      </div>
    </div>
  );
}
