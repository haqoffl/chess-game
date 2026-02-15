'use client';

import { motion } from 'framer-motion';
import { Difficulty } from '../types/chess';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string; description: string; color: string }[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Beginner friendly',
    color: 'text-emerald-400 border-emerald-500 bg-emerald-500/10',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Intermediate',
    color: 'text-yellow-400 border-yellow-500 bg-yellow-500/10',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Advanced AI',
    color: 'text-red-400 border-red-500 bg-red-500/10',
  },
];

export function DifficultySelector({ value, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
        Bot Difficulty
      </label>
      <div className="flex gap-2">
        {DIFFICULTIES.map((d) => {
          const isSelected = value === d.value;
          return (
            <motion.button
              key={d.value}
              onClick={() => !disabled && onChange(d.value)}
              disabled={disabled}
              className={`
                flex-1 py-2 px-2 rounded-lg border text-sm font-semibold transition-all duration-200
                ${isSelected ? d.color : 'text-zinc-500 border-zinc-700 bg-transparent hover:border-zinc-500'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              whileHover={disabled ? {} : { scale: 1.03 }}
              whileTap={disabled ? {} : { scale: 0.97 }}
            >
              {d.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
