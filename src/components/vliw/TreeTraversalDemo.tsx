import { useState, useCallback, useEffect } from "react";

interface TreeNode {
  id: number;
  value: number;
  level: number;
  x: number;
  y: number;
}

interface Walker {
  id: number;
  idx: number;
  value: number;
  trail: number[];
}

function hashStep(a: number): number {
  // Simplified single hash stage for demo
  a = ((a + 0x7ed55d16) + (a << 12)) >>> 0;
  a = ((a ^ 0xc761c23c) ^ (a >>> 19)) >>> 0;
  return a;
}

function buildTree(height: number): TreeNode[] {
  const nodes: TreeNode[] = [];
  const totalNodes = Math.pow(2, height + 1) - 1;
  
  for (let i = 0; i < totalNodes; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const levelStart = Math.pow(2, level) - 1;
    const posInLevel = i - levelStart;
    const nodesInLevel = Math.pow(2, level);
    
    const x = ((posInLevel + 0.5) / nodesInLevel) * 100;
    const y = (level / height) * 100;
    
    nodes.push({
      id: i,
      value: Math.floor(Math.random() * 1000),
      level,
      x,
      y,
    });
  }
  
  return nodes;
}

function TreeVisualization({ 
  nodes, 
  height,
  walkers,
  highlightedNode,
}: { 
  nodes: TreeNode[];
  height: number;
  walkers: Walker[];
  highlightedNode: number | null;
}) {
  const svgWidth = 400;
  const svgHeight = 250;
  const padding = 30;
  
  const scaleX = (x: number) => padding + (x / 100) * (svgWidth - 2 * padding);
  const scaleY = (y: number) => padding + (y / 100) * (svgHeight - 2 * padding);
  
  // Draw edges
  const edges: { from: TreeNode; to: TreeNode }[] = [];
  for (let i = 1; i < nodes.length; i++) {
    const parentIdx = Math.floor((i - 1) / 2);
    edges.push({ from: nodes[parentIdx], to: nodes[i] });
  }

  // Get walker positions
  const walkerPositions = walkers.map(w => nodes[w.idx]);

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-md">
      {/* Edges */}
      {edges.map((edge, i) => (
        <line
          key={i}
          x1={scaleX(edge.from.x)}
          y1={scaleY(edge.from.y)}
          x2={scaleX(edge.to.x)}
          y2={scaleY(edge.to.y)}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={1}
        />
      ))}
      
      {/* Walker trails */}
      {walkers.map((walker, wi) => (
        <g key={`trail-${wi}`}>
          {walker.trail.map((nodeIdx, ti) => {
            if (ti === 0) return null;
            const prevNode = nodes[walker.trail[ti - 1]];
            const currNode = nodes[nodeIdx];
            return (
              <line
                key={ti}
                x1={scaleX(prevNode.x)}
                y1={scaleY(prevNode.y)}
                x2={scaleX(currNode.x)}
                y2={scaleY(currNode.y)}
                stroke={`hsl(${wi * 60}, 70%, 50%)`}
                strokeWidth={2}
                strokeOpacity={0.6}
              />
            );
          })}
        </g>
      ))}
      
      {/* Nodes */}
      {nodes.map((node) => {
        const isHighlighted = node.id === highlightedNode;
        const hasWalker = walkers.some(w => w.idx === node.id);
        
        return (
          <g key={node.id}>
            <circle
              cx={scaleX(node.x)}
              cy={scaleY(node.y)}
              r={isHighlighted ? 12 : hasWalker ? 10 : 6}
              fill={isHighlighted ? "var(--accent)" : hasWalker ? "hsl(200, 70%, 50%)" : "var(--bg-paper)"}
              stroke={isHighlighted ? "var(--accent)" : "currentColor"}
              strokeOpacity={isHighlighted ? 1 : 0.3}
              strokeWidth={isHighlighted ? 2 : 1}
              className="transition-all duration-200"
            />
            {(isHighlighted || hasWalker) && (
              <text
                x={scaleX(node.x)}
                y={scaleY(node.y) + 4}
                textAnchor="middle"
                className="text-[8px] fill-current font-mono"
                fill={isHighlighted || hasWalker ? "white" : "currentColor"}
              >
                {node.id}
              </text>
            )}
          </g>
        );
      })}
      
      {/* Level labels */}
      {Array.from({ length: height + 1 }, (_, level) => (
        <text
          key={level}
          x={10}
          y={scaleY((level / height) * 100) + 4}
          className="text-[9px] fill-current opacity-40 font-mono"
        >
          L{level}
        </text>
      ))}
    </svg>
  );
}

const TOTAL_ROUNDS = 16;

export default function TreeTraversalDemo() {
  const height = 4;
  const [nodes] = useState(() => buildTree(height));
  const [walkers, setWalkers] = useState<Walker[]>([
    { id: 0, idx: 0, value: 12345, trail: [0] },
  ]);
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepDetail, setStepDetail] = useState<string | null>(null);

  const totalNodes = nodes.length;
  const isDone = round >= TOTAL_ROUNDS;

  const step = useCallback(() => {
    if (round >= TOTAL_ROUNDS) return;
    
    setWalkers(prev => prev.map(walker => {
      const nodeVal = nodes[walker.idx].value;
      const xored = (walker.value ^ nodeVal) >>> 0;
      const hashed = hashStep(xored);
      const goLeft = hashed % 2 === 0;
      let newIdx = 2 * walker.idx + (goLeft ? 1 : 2);
      
      // Wrap around
      if (newIdx >= totalNodes) {
        newIdx = 0;
      }
      
      setStepDetail(
        `val=${walker.value} ⊕ node[${walker.idx}]=${nodeVal} → hash=${hashed} → ${goLeft ? "LEFT" : "RIGHT"} → idx=${newIdx}`
      );
      
      return {
        ...walker,
        idx: newIdx,
        value: hashed,
        trail: [...walker.trail.slice(-5), newIdx],
      };
    }));
    setRound(r => r + 1);
  }, [nodes, totalNodes, round]);

  const reset = useCallback(() => {
    setWalkers([{ id: 0, idx: 0, value: Math.floor(Math.random() * 100000), trail: [0] }]);
    setRound(0);
    setStepDetail(null);
    setIsPlaying(false);
  }, []);

  // Auto-play - stops at 16 rounds
  useEffect(() => {
    if (!isPlaying || isDone) {
      if (isDone) setIsPlaying(false);
      return;
    }
    const interval = setInterval(step, 800);
    return () => clearInterval(interval);
  }, [isPlaying, step, isDone]);

  return (
    <div className="not-prose my-8">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--bg-paper)] border-b border-[var(--border)] p-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Tree Traversal Visualization
          </h4>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Simplified demo (height=4, 1 walker). Real challenge: height=10, 256 walkers, 16 rounds.
          </p>
        </div>

        <div className="p-4 flex flex-col md:flex-row gap-6">
          {/* Tree visualization */}
          <div className="flex-1 flex items-center justify-center bg-[var(--bg)] rounded-lg p-4">
            <TreeVisualization
              nodes={nodes}
              height={height}
              walkers={walkers}
              highlightedNode={walkers[0]?.idx ?? null}
            />
          </div>

          {/* Info panel */}
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-[var(--bg-paper)] rounded-lg p-3">
              <div className="font-mono text-xs text-[var(--text-faint)] uppercase mb-2">Round</div>
              <div className="font-mono text-3xl font-bold">
                {round}<span className="text-base text-[var(--text-faint)]">/{TOTAL_ROUNDS}</span>
              </div>
              {isDone && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-mono">Done!</div>
              )}
            </div>

            <div className="bg-[var(--bg-paper)] rounded-lg p-3">
              <div className="font-mono text-xs text-[var(--text-faint)] uppercase mb-2">Walker State</div>
              <div className="space-y-1 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">idx:</span>
                  <span>{walkers[0]?.idx}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">val:</span>
                  <span>{walkers[0]?.value}</span>
                </div>
              </div>
            </div>

            {stepDetail && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="font-mono text-xs text-blue-400 break-all">
                  {stepDetail}
                </div>
              </div>
            )}

            <div className="bg-[var(--bg-paper)] rounded-lg p-3">
              <div className="font-mono text-xs text-[var(--text-faint)] uppercase mb-2">Algorithm</div>
              <ol className="text-xs text-[var(--text-muted)] space-y-1 list-decimal list-inside">
                <li>XOR value with node</li>
                <li>Hash the result</li>
                <li>Go left if even, right if odd</li>
                <li>Wrap to root if at leaf</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[var(--bg-paper)] border-t border-[var(--border)] p-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded font-mono text-xs bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
            >
              Reset
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={isDone}
              className={`px-4 py-1.5 rounded font-mono text-xs transition-all disabled:opacity-30 ${
                isPlaying
                  ? "bg-orange-500 text-white"
                  : "bg-[var(--accent)] text-[var(--bg)]"
              }`}
            >
              {isPlaying ? "Pause" : "Auto-play"}
            </button>
            <button
              onClick={step}
              disabled={isPlaying || isDone}
              className="px-3 py-1.5 rounded font-mono text-xs bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 transition-all"
            >
              Step →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
