'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PieceSymbol } from '../lib/pieceIcons';
import { getPieceUnicode } from '../lib/pieceIcons';

interface PromotionModalProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: PieceSymbol) => void;
}

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];

export function PromotionModal({ isOpen, color, onSelect }: PromotionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <h3 className="text-white font-semibold text-center mb-4">
              Promote Pawn
            </h3>
            <div className="flex gap-3">
              {PROMOTION_PIECES.map((piece) => (
                <motion.button
                  key={piece}
                  onClick={() => onSelect(piece)}
                  className="w-16 h-16 flex items-center justify-center text-4xl bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-600 hover:border-blue-500 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={piece.toUpperCase()}
                >
                  {getPieceUnicode(color, piece)}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
