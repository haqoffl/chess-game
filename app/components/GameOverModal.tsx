'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GameStatus, PlayerColor, Difficulty } from '../types/chess';

interface GameOverModalProps {
  isOpen: boolean;
  status: GameStatus;
  winner: PlayerColor | null;
  playerColor: PlayerColor;
  onNewGame: (color?: PlayerColor, difficulty?: Difficulty) => void;
  onClose: () => void;
}

const STATUS_MESSAGES: Record<GameStatus, string> = {
  checkmate: 'Checkmate!',
  stalemate: 'Stalemate!',
  draw: 'Draw!',
  resigned: 'Resigned',
  playing: '',
};

const STATUS_DESCRIPTIONS: Record<GameStatus, string> = {
  checkmate: 'The king has nowhere to run.',
  stalemate: "No legal moves remain — it's a draw.",
  draw: 'The game ended in a draw.',
  resigned: 'The game ended by resignation.',
  playing: '',
};

export function GameOverModal({
  isOpen,
  status,
  winner,
  playerColor,
  onNewGame,
  onClose,
}: GameOverModalProps) {
  const didPlayerWin = winner === playerColor;
  const didBotWin = winner !== null && winner !== playerColor;

  const emoji = didPlayerWin ? '🎉' : didBotWin ? '🤖' : '🤝';
  const resultText = didPlayerWin
    ? 'You Win!'
    : didBotWin
    ? 'Bot Wins!'
    : STATUS_MESSAGES[status];

  const resultColor = didPlayerWin
    ? 'text-emerald-400'
    : didBotWin
    ? 'text-red-400'
    : 'text-yellow-400';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Confetti-like decoration for wins */}
            {didPlayerWin && (
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: `hsl(${i * 30}, 70%, 60%)`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 20, 0],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="text-5xl mb-4">{emoji}</div>

            <h2 className={`text-3xl font-bold mb-2 ${resultColor}`}>
              {resultText}
            </h2>

            <p className="text-zinc-400 mb-2 text-sm">
              {STATUS_MESSAGES[status]}
            </p>
            <p className="text-zinc-500 mb-6 text-sm">
              {STATUS_DESCRIPTIONS[status]}
            </p>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={() => onNewGame(playerColor)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Play Again
              </motion.button>

              <motion.button
                onClick={() => onNewGame(playerColor === 'w' ? 'b' : 'w')}
                className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Switch Sides
              </motion.button>

              <motion.button
                onClick={onClose}
                className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Review Game
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
