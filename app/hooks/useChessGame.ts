'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Move, Square, PieceSymbol, Color } from 'chess.js';
import {
  GameState,
  ChessGameOptions,
  CapturedPieces,
  MoveHistoryEntry,
  Difficulty,
  PlayerColor,
  TimerState,
} from '../types/chess';
import { useStockfish } from './useStockfish';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function computeCapturedPieces(history: { captured?: string; color: string }[]): CapturedPieces {
  const captured: CapturedPieces = { w: [], b: [] };
  for (const move of history) {
    if (move.captured) {
      // The capturing side's color determines which array
      // If white captures, it goes into white's captured (pieces black lost)
      if (move.color === 'w') {
        captured.w.push(move.captured as PieceSymbol);
      } else {
        captured.b.push(move.captured as PieceSymbol);
      }
    }
  }
  return captured;
}

function buildGameState(chess: Chess, previousFen: string): Partial<GameState> {
  const history = chess.history({ verbose: true }) as Move[];
  const lastMoveRaw = history[history.length - 1];

  const moveHistory: MoveHistoryEntry[] = history.map((m, i) => ({
    san: m.san,
    fen: '', // We don't store FEN per move here for simplicity
    moveNumber: Math.floor(i / 2) + 1,
    color: m.color,
  }));

  const capturedPieces = computeCapturedPieces(
    history.map((m) => ({ captured: m.captured, color: m.color }))
  );

  let winner: PlayerColor | null = null;
  if (chess.isCheckmate()) {
    winner = chess.turn() === 'w' ? 'b' : 'w';
  }

  let status: GameState['status'] = 'playing';
  if (chess.isCheckmate()) status = 'checkmate';
  else if (chess.isStalemate()) status = 'stalemate';
  else if (chess.isDraw()) status = 'draw';

  return {
    fen: chess.fen(),
    isCheck: chess.inCheck(),
    isCheckmate: chess.isCheckmate(),
    isStalemate: chess.isStalemate(),
    isDraw: chess.isDraw(),
    isGameOver: chess.isGameOver(),
    turn: chess.turn(),
    capturedPieces,
    moveHistory,
    lastMove: lastMoveRaw ? { from: lastMoveRaw.from as Square, to: lastMoveRaw.to as Square } : null,
    status,
    winner,
  };
}

export function useChessGame(options: ChessGameOptions) {
  const chessRef = useRef(new Chess());
  const [gameState, setGameState] = useState<GameState>({
    fen: INITIAL_FEN,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    isGameOver: false,
    turn: 'w',
    capturedPieces: { w: [], b: [] },
    moveHistory: [],
    lastMove: null,
    status: 'playing',
    winner: null,
  });

  const [isBotThinking, setIsBotThinking] = useState(false);
  const [difficulty, setDifficultyState] = useState<Difficulty>(options.difficulty);
  const [playerColor, setPlayerColor] = useState<PlayerColor>(options.playerColor);

  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    white: options.timeLimit || 600,
    black: options.timeLimit || 600,
    isRunning: false,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isReady: stockfishIsReady,
    getBestMove: stockfishGetBestMove,
    setDifficulty: stockfishSetDifficulty,
    stop: stockfishStop,
  } = useStockfish();

  // Update difficulty in stockfish when it changes
  useEffect(() => {
    stockfishSetDifficulty(difficulty);
  }, [difficulty, stockfishSetDifficulty]);

  // Timer effect
  useEffect(() => {
    if (timer.isRunning && !gameState.isGameOver && options.timeLimit) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          const activeColor = gameState.turn;
          const newTime = {
            ...prev,
            [activeColor === 'w' ? 'white' : 'black']:
              activeColor === 'w' ? prev.white - 1 : prev.black - 1,
          };

          // Time ran out
          if (activeColor === 'w' && newTime.white <= 0) {
            clearInterval(timerRef.current!);
            setGameState((gs) => ({ ...gs, isGameOver: true, status: 'draw', winner: 'b' }));
          } else if (activeColor === 'b' && newTime.black <= 0) {
            clearInterval(timerRef.current!);
            setGameState((gs) => ({ ...gs, isGameOver: true, status: 'draw', winner: 'w' }));
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer.isRunning, gameState.turn, gameState.isGameOver, options.timeLimit]);

  const refreshGameState = useCallback(() => {
    const chess = chessRef.current;
    const partial = buildGameState(chess, chess.fen());
    setGameState((prev) => ({
      ...prev,
      ...partial,
    }));
  }, []);

  const triggerBotMove = useCallback(() => {
    const chess = chessRef.current;
    if (chess.isGameOver()) return;
    if (chess.turn() === playerColor) return; // It's player's turn

    setIsBotThinking(true);

    const fen = chess.fen();

    stockfishGetBestMove(fen, (moveStr: string) => {
      setIsBotThinking(false);

      const from = moveStr.slice(0, 2) as Square;
      const to = moveStr.slice(2, 4) as Square;
      const promotion = moveStr.length > 4 ? moveStr[4] : undefined;

      try {
        const move = chessRef.current.move({
          from,
          to,
          promotion: promotion || 'q',
        });

        if (move) {
          refreshGameState();
        }
      } catch (e) {
        console.error('Bot move error:', e);
      }
    });
  }, [playerColor, stockfishGetBestMove, refreshGameState]);

  // Trigger bot move when it's the bot's turn
  useEffect(() => {
    if (!gameState.isGameOver && gameState.turn !== playerColor && !isBotThinking) {
      const delay = setTimeout(() => {
        triggerBotMove();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [gameState.turn, gameState.isGameOver, playerColor, isBotThinking, triggerBotMove]);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      const chess = chessRef.current;

      if (chess.isGameOver()) return false;
      if (chess.turn() !== playerColor) return false;

      try {
        const move = chess.move({
          from,
          to,
          promotion: promotion || 'q',
        });

        if (move) {
          // Start timer on first move
          if (chess.history().length === 1) {
            setTimer((prev) => ({ ...prev, isRunning: true }));
          }
          refreshGameState();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [playerColor, refreshGameState]
  );

  const undoMove = useCallback(() => {
    const chess = chessRef.current;
    // Undo two moves (player's and bot's)
    chess.undo();
    chess.undo();
    stockfishStop();
    setIsBotThinking(false);
    refreshGameState();
  }, [stockfishStop, refreshGameState]);

  const newGame = useCallback(
    (newPlayerColor?: PlayerColor, newDifficulty?: Difficulty) => {
      stockfishStop();
      chessRef.current = new Chess();
      setIsBotThinking(false);

      if (newPlayerColor) setPlayerColor(newPlayerColor);
      if (newDifficulty) setDifficultyState(newDifficulty);

      setTimer({
        white: options.timeLimit || 600,
        black: options.timeLimit || 600,
        isRunning: false,
      });

      setGameState({
        fen: INITIAL_FEN,
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: false,
        isGameOver: false,
        turn: 'w',
        capturedPieces: { w: [], b: [] },
        moveHistory: [],
        lastMove: null,
        status: 'playing',
        winner: null,
      });
    },
    [stockfishStop, options.timeLimit]
  );

  const getLegalMoves = useCallback((square: Square): Square[] => {
    const chess = chessRef.current;
    const moves = chess.moves({ square, verbose: true }) as Move[];
    return moves.map((m) => m.to as Square);
  }, []);

  const isPawnPromotion = useCallback((from: Square, to: Square): boolean => {
    const chess = chessRef.current;
    const piece = chess.get(from);
    if (!piece || piece.type !== 'p') return false;

    const toRank = to[1];
    return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1');
  }, []);

  return {
    gameState,
    isBotThinking,
    difficulty,
    playerColor,
    timer,
    stockfishReady: stockfishIsReady,
    makeMove,
    undoMove,
    newGame,
    getLegalMoves,
    isPawnPromotion,
    setDifficulty: setDifficultyState,
  };
}
