'use client';

import { motion } from 'framer-motion';
import { PlayerColor } from '../types/chess';

interface ColorSelectorProps {
  value: PlayerColor;
  onChange: (c: PlayerColor) => void;
  disabled?: boolean;
}

export function ColorSelector({ value, onChange, disabled }: ColorSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
        Play As
      </label>
      <div className="flex gap-2">
        <motion.button
          onClick={() => !disabled && onChange('w')}
          disabled={disabled}
          className={`
            flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${value === 'w'
              ? 'text-white border-white bg-white/10'
              : 'text-zinc-500 border-zinc-700 hover:border-zinc-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          whileHover={disabled ? {} : { scale: 1.03 }}
          whileTap={disabled ? {} : { scale: 0.97 }}
        >
          <span className="text-lg">♔</span>
          White
        </motion.button>

        <motion.button
          onClick={() => !disabled && onChange('b')}
          disabled={disabled}
          className={`
            flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${value === 'b'
              ? 'text-zinc-900 border-zinc-800 bg-zinc-700'
              : 'text-zinc-500 border-zinc-700 hover:border-zinc-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          whileHover={disabled ? {} : { scale: 1.03 }}
          whileTap={disabled ? {} : { scale: 0.97 }}
        >
          <span className="text-lg">♚</span>
          Black
        </motion.button>
      </div>
    </div>
  );
}
