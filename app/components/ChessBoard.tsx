'use client';

import { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, PlayerColor } from '../types/chess';
import { PromotionModal } from './PromotionModal';
import { PieceSymbol } from '../lib/pieceIcons';
// react-chessboard v5 handler types (defined locally to avoid import issues)
type SquareHandlerArgs = { piece: { pieceType: string } | null; square: string };
type PieceDropHandlerArgs = { piece: { pieceType: string; isSparePiece: boolean; position: string }; sourceSquare: string; targetSquare: string | null };
type PieceHandlerArgs = { isSparePiece: boolean; piece: { pieceType: string }; square: string | null };

interface ChessBoardProps {
  gameState: GameState;
  playerColor: PlayerColor;
  isBotThinking: boolean;
  onMove: (from: Square, to: Square, promotion?: string) => boolean;
  getLegalMoves: (square: Square) => Square[];
  isPawnPromotion: (from: Square, to: Square) => boolean;
}

type SquareStyles = Record<string, React.CSSProperties>;

export function ChessBoard({
  gameState,
  playerColor,
  isBotThinking,
  onMove,
  getLegalMoves,
  isPawnPromotion,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoveSquares, setLegalMoveSquares] = useState<Square[]>([]);
  const [promotionPending, setPromotionPending] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  // Reset selection when it's bot's turn or game over
  useEffect(() => {
    if (gameState.turn !== playerColor || gameState.isGameOver) {
      setSelectedSquare(null);
      setLegalMoveSquares([]);
    }
  }, [gameState.turn, playerColor, gameState.isGameOver]);

  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      const sq = square as Square;
      if (gameState.turn !== playerColor || gameState.isGameOver) return;

      // If a square is already selected, try to move
      if (selectedSquare) {
        if (legalMoveSquares.includes(sq)) {
          // Check for pawn promotion
          if (isPawnPromotion(selectedSquare, sq)) {
            setPromotionPending({ from: selectedSquare, to: sq });
            setSelectedSquare(null);
            setLegalMoveSquares([]);
            return;
          }

          const success = onMove(selectedSquare, sq);
          if (success) {
            setSelectedSquare(null);
            setLegalMoveSquares([]);
            return;
          }
        }

        // Clicked same square — deselect
        if (sq === selectedSquare) {
          setSelectedSquare(null);
          setLegalMoveSquares([]);
          return;
        }
      }

      // Select a new square
      const moves = getLegalMoves(sq);
      if (moves.length > 0) {
        setSelectedSquare(sq);
        setLegalMoveSquares(moves);
      } else {
        setSelectedSquare(null);
        setLegalMoveSquares([]);
      }
    },
    [selectedSquare, legalMoveSquares, gameState, playerColor, onMove, getLegalMoves, isPawnPromotion]
  );

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;
      if (gameState.turn !== playerColor || gameState.isGameOver) return false;

      const from = sourceSquare as Square;
      const to = targetSquare as Square;

      setSelectedSquare(null);
      setLegalMoveSquares([]);

      if (isPawnPromotion(from, to)) {
        setPromotionPending({ from, to });
        return false; // Return false to reset board; modal will handle it
      }

      return onMove(from, to);
    },
    [gameState, playerColor, onMove, isPawnPromotion]
  );

  const handlePieceClick = useCallback(
    ({ square }: PieceHandlerArgs) => {
      if (square) {
        handleSquareClick({ square, piece: null });
      }
    },
    [handleSquareClick]
  );

  const handlePromotionSelect = useCallback(
    (piece: PieceSymbol) => {
      if (!promotionPending) return;
      onMove(promotionPending.from, promotionPending.to, piece);
      setPromotionPending(null);
    },
    [promotionPending, onMove]
  );

  // Build custom square styles
  const squareStyles: SquareStyles = {};

  // Last move highlight
  if (gameState.lastMove) {
    const lastMoveStyle: React.CSSProperties = {
      backgroundColor: 'rgba(255, 220, 0, 0.3)',
    };
    squareStyles[gameState.lastMove.from] = lastMoveStyle;
    squareStyles[gameState.lastMove.to] = lastMoveStyle;
  }

  // Selected square highlight
  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      backgroundColor: 'rgba(20, 150, 255, 0.5)',
      boxShadow: 'inset 0 0 0 3px rgba(20, 150, 255, 0.8)',
    };
  }

  // Legal move dots
  legalMoveSquares.forEach((sq) => {
    const existing = squareStyles[sq] || {};
    squareStyles[sq] = {
      ...existing,
      background:
        'radial-gradient(circle, rgba(20, 200, 100, 0.5) 25%, transparent 25%)',
    };
  });

  // Check highlight — find the king in check
  if (gameState.isCheck && !gameState.isCheckmate) {
    const turn = gameState.turn;
    const fenBoard = gameState.fen.split(' ')[0];
    let file = 0;
    let rank = 7;
    let kingSquare: string | null = null;
    const kingChar = turn === 'w' ? 'K' : 'k';

    for (const ch of fenBoard) {
      if (ch === '/') {
        rank--;
        file = 0;
      } else if (/\d/.test(ch)) {
        file += parseInt(ch);
      } else {
        if (ch === kingChar) {
          kingSquare = String.fromCharCode(97 + file) + (rank + 1).toString();
        }
        file++;
      }
    }

    if (kingSquare) {
      squareStyles[kingSquare] = {
        ...squareStyles[kingSquare],
        backgroundColor: 'rgba(220, 30, 30, 0.7)',
        boxShadow: 'inset 0 0 0 3px rgba(255, 0, 0, 0.9)',
      };
    }
  }

  return (
    <div className="relative chess-board-wrapper">
      <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-zinc-700">
        <Chessboard
          options={{
            position: gameState.fen,
            boardOrientation: playerColor === 'w' ? 'white' : 'black',
            squareStyles,
            boardStyle: {
              borderRadius: '0',
              boxShadow: 'none',
            },
            darkSquareStyle: { backgroundColor: '#4a7fa5' },
            lightSquareStyle: { backgroundColor: '#e8f4f8' },
            dropSquareStyle: {
              boxShadow: 'inset 0 0 1px 4px rgba(20, 200, 100, 0.8)',
            },
            allowDragging: gameState.turn === playerColor && !gameState.isGameOver,
            animationDurationInMs: 200,
            onSquareClick: handleSquareClick,
            onPieceDrop: handlePieceDrop,
            onPieceClick: handlePieceClick,
          }}
        />
      </div>

      {/* Bot thinking overlay */}
      <AnimatePresence>
        {isBotThinking && (
          <motion.div
            className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2 bg-zinc-900/90 backdrop-blur-sm rounded-lg px-3 py-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-blue-300 font-medium">Bot is thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <PromotionModal
        isOpen={!!promotionPending}
        color={playerColor}
        onSelect={handlePromotionSelect}
      />
    </div>
  );
}
