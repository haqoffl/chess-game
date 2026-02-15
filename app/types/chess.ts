import { Chess, Move, Square, PieceSymbol, Color } from 'chess.js';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
export type PlayerColor = 'w' | 'b';

export interface CapturedPieces {
  w: PieceSymbol[];
  b: PieceSymbol[];
}

export interface MoveHistoryEntry {
  san: string;
  fen: string;
  moveNumber: number;
  color: Color;
}

export interface GameState {
  fen: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  turn: Color;
  capturedPieces: CapturedPieces;
  moveHistory: MoveHistoryEntry[];
  lastMove: { from: Square; to: Square } | null;
  status: GameStatus;
  winner: PlayerColor | null;
}

export interface ChessGameOptions {
  playerColor: PlayerColor;
  difficulty: Difficulty;
  timeLimit: number | null; // seconds per side, null = unlimited
}

export interface TimerState {
  white: number;
  black: number;
  isRunning: boolean;
}
