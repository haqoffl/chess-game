'use client';

import { motion } from 'framer-motion';
import { TimerState } from '../types/chess';

interface GameTimerProps {
  timer: TimerState;
  activeColor: 'w' | 'b';
  color: 'w' | 'b';
  label: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GameTimer({ timer, activeColor, color, label }: GameTimerProps) {
  const time = color === 'w' ? timer.white : timer.black;
  const isActive = activeColor === color && timer.isRunning;
  const isLow = time <= 30;
  const isCritical = time <= 10;

  return (
    <motion.div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xl font-bold transition-all duration-300
        ${isActive
          ? isCritical
            ? 'bg-red-600 text-white shadow-lg shadow-red-500/40'
            : isLow
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
            : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-zinc-800 text-zinc-400'
        }
      `}
      animate={isActive && isCritical ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <div className="flex flex-col">
        <span className="text-xs font-normal opacity-70 uppercase tracking-widest">{label}</span>
        <span className={`${isCritical && isActive ? 'text-white' : ''}`}>
          {formatTime(time)}
        </span>
      </div>
      {isActive && (
        <motion.div
          className="w-2 h-2 rounded-full bg-current opacity-80"
          animate={{ opacity: [0.8, 0.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </motion.div>
  );
}
