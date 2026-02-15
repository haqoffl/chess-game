'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessGame } from '../hooks/useChessGame';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { CapturedPiecesDisplay } from './CapturedPieces';
import { GameOverModal } from './GameOverModal';
import { DifficultySelector } from './DifficultySelector';
import { ColorSelector } from './ColorSelector';
import { GameTimer } from './GameTimer';
import { Difficulty, PlayerColor } from '../types/chess';

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${color}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </motion.span>
  );
}

const USE_TIMER = false; // Set to true to enable game timers (10 min per side)
const TIME_LIMIT = USE_TIMER ? 600 : null;

export function ChessGame() {
  const [gameKey, setGameKey] = useState(0);
  const [pendingColor, setPendingColor] = useState<PlayerColor>('w');
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>('medium');
  const [showGameOver, setShowGameOver] = useState(false);

  const {
    gameState,
    isBotThinking,
    difficulty,
    playerColor,
    timer,
    stockfishReady,
    makeMove,
    undoMove,
    newGame,
    getLegalMoves,
    isPawnPromotion,
    setDifficulty,
  } = useChessGame({
    playerColor: pendingColor,
    difficulty: pendingDifficulty,
    timeLimit: TIME_LIMIT,
  });

  // Show game over modal when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      const timeout = setTimeout(() => setShowGameOver(true), 600);
      return () => clearTimeout(timeout);
    } else {
      setShowGameOver(false);
    }
  }, [gameState.isGameOver]);

  const handleNewGame = (color?: PlayerColor, diff?: Difficulty) => {
    setShowGameOver(false);
    const newColor = color || pendingColor;
    const newDiff = diff || pendingDifficulty;
    setPendingColor(newColor);
    setPendingDifficulty(newDiff);
    newGame(newColor, newDiff);
    setGameKey((k) => k + 1);
  };

  const handleDifficultyChange = (d: Difficulty) => {
    setPendingDifficulty(d);
    setDifficulty(d);
  };

  const handleColorChange = (c: PlayerColor) => {
    setPendingColor(c);
    handleNewGame(c, pendingDifficulty);
  };

  const botColor = playerColor === 'w' ? 'b' : 'w';
  const isPlayerTurn = gameState.turn === playerColor;
  const isBotTurn = gameState.turn === botColor;

  const turnLabel = gameState.isGameOver
    ? null
    : isPlayerTurn
    ? 'Your Turn'
    : 'Bot is thinking...';

  const turnColor = isPlayerTurn
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-blue-500/20 text-blue-300';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♞</span>
            <div>
              <h1 className="text-xl font-bold text-white">Chess AI</h1>
              <p className="text-xs text-zinc-500">Human vs Bot</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {stockfishReady ? (
              <StatusBadge label="Stockfish Ready" color="bg-emerald-500/20 text-emerald-400" />
            ) : (
              <StatusBadge label="Minimax AI" color="bg-yellow-500/20 text-yellow-400" />
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full p-4 lg:p-6">
        {/* Left sidebar - Bot info */}
        <aside className="lg:w-72 flex flex-col gap-4 order-2 lg:order-1">
          {/* Bot player card */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xl">
                {botColor === 'w' ? '♔' : '♚'}
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {stockfishReady ? 'Stockfish' : 'Minimax Bot'}
                </div>
                <div className="text-xs text-zinc-500 capitalize">{difficulty} difficulty</div>
              </div>
              {isBotTurn && !gameState.isGameOver && (
                <motion.div
                  className="ml-auto w-2 h-2 rounded-full bg-blue-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </div>

            {USE_TIMER && (
              <GameTimer
                timer={timer}
                activeColor={gameState.turn}
                color={botColor}
                label={botColor === 'w' ? 'White' : 'Black'}
              />
            )}

            <CapturedPiecesDisplay
              capturedPieces={gameState.capturedPieces}
              perspective={botColor}
            />
          </div>

          {/* Move history */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex-1">
            <MoveHistory moves={gameState.moveHistory} />
          </div>
        </aside>

        {/* Center - Chess board */}
        <div className="flex-1 flex flex-col items-center gap-4 order-1 lg:order-2">
          {/* Status indicator */}
          <AnimatePresence mode="wait">
            {turnLabel && (
              <motion.div
                key={turnLabel}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StatusBadge label={turnLabel} color={turnColor} />
              </motion.div>
            )}
            {gameState.isCheck && !gameState.isGameOver && (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ml-2"
              >
                <StatusBadge label="CHECK!" color="bg-red-500/20 text-red-400" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Board */}
          <div className="w-full max-w-[600px]">
            <ChessBoard
              key={gameKey}
              gameState={gameState}
              playerColor={playerColor}
              isBotThinking={isBotThinking}
              onMove={makeMove}
              getLegalMoves={getLegalMoves}
              isPawnPromotion={isPawnPromotion}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap justify-center">
            <motion.button
              onClick={() => handleNewGame()}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold transition-colors border border-zinc-700"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>New Game</span>
            </motion.button>

            <motion.button
              onClick={undoMove}
              disabled={gameState.moveHistory.length < 2 || gameState.isGameOver}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-colors border border-zinc-700"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Undo Move</span>
            </motion.button>

            <motion.button
              onClick={() => {
                newGame(playerColor, difficulty);
                setGameKey((k) => k + 1);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-900/50 hover:bg-red-800/50 rounded-xl text-sm font-semibold transition-colors border border-red-800/50 text-red-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Resign</span>
            </motion.button>
          </div>
        </div>

        {/* Right sidebar - Player info + settings */}
        <aside className="lg:w-72 flex flex-col gap-4 order-3">
          {/* Human player card */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">
                {playerColor === 'w' ? '♔' : '♚'}
              </div>
              <div>
                <div className="font-semibold text-sm">You</div>
                <div className="text-xs text-zinc-500">{playerColor === 'w' ? 'White' : 'Black'}</div>
              </div>
              {isPlayerTurn && !gameState.isGameOver && (
                <motion.div
                  className="ml-auto w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </div>

            {USE_TIMER && (
              <GameTimer
                timer={timer}
                activeColor={gameState.turn}
                color={playerColor}
                label={playerColor === 'w' ? 'White' : 'Black'}
              />
            )}
          </div>

          {/* Game Settings */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Game Settings
            </h3>

            <DifficultySelector
              value={difficulty}
              onChange={handleDifficultyChange}
            />

            <ColorSelector
              value={playerColor}
              onChange={handleColorChange}
            />
          </div>

          {/* Game stats */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
              Game Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Moves</span>
                <span className="text-zinc-300 font-mono">{gameState.moveHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Turn</span>
                <span className="text-zinc-300 font-mono">
                  {Math.floor(gameState.moveHistory.length / 2) + 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <span className={`font-mono capitalize ${
                  gameState.isCheck ? 'text-red-400' :
                  gameState.isGameOver ? 'text-yellow-400' :
                  'text-emerald-400'
                }`}>
                  {gameState.isGameOver ? gameState.status : gameState.isCheck ? 'Check' : 'Playing'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOver}
        status={gameState.status}
        winner={gameState.winner}
        playerColor={playerColor}
        onNewGame={handleNewGame}
        onClose={() => setShowGameOver(false)}
      />
    </div>
  );
}
