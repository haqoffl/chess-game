'use client';

import { useEffect, useRef } from 'react';
import { MoveHistoryEntry } from '../types/chess';

interface MoveHistoryProps {
  moves: MoveHistoryEntry[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  // Group moves into pairs (white, black)
  const movePairs: { white: MoveHistoryEntry; black?: MoveHistoryEntry; moveNum: number }[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      white: moves[i],
      black: moves[i + 1],
      moveNum: moves[i].moveNumber,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Move History
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-1"
        style={{ maxHeight: '280px' }}
      >
        {movePairs.length === 0 ? (
          <div className="text-zinc-600 text-sm text-center py-4 italic">
            No moves yet
          </div>
        ) : (
          <div className="space-y-0.5">
            {movePairs.map((pair) => (
              <div
                key={pair.moveNum}
                className="grid grid-cols-[2rem_1fr_1fr] gap-1 text-sm"
              >
                <span className="text-zinc-600 font-mono text-xs pt-1">{pair.moveNum}.</span>
                <span
                  className={`
                    px-2 py-0.5 rounded font-mono text-sm
                    ${pair.black === undefined ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-zinc-300 hover:bg-zinc-700/50'}
                  `}
                >
                  {pair.white.san}
                </span>
                {pair.black && (
                  <span
                    className={`
                      px-2 py-0.5 rounded font-mono text-sm
                      ${pair.black === moves[moves.length - 1] ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-zinc-300 hover:bg-zinc-700/50'}
                    `}
                  >
                    {pair.black.san}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
