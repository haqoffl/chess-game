'use client';

import { CapturedPieces as CapturedPiecesType } from '../types/chess';
import { PieceSymbol, getPieceUnicode, PIECE_VALUES_DISPLAY } from '../lib/pieceIcons';

interface CapturedPiecesProps {
  capturedPieces: CapturedPiecesType;
  perspective: 'w' | 'b'; // whose captured pieces to show on top
}

function sortByValue(pieces: PieceSymbol[]): PieceSymbol[] {
  return [...pieces].sort(
    (a, b) => (PIECE_VALUES_DISPLAY[b] || 0) - (PIECE_VALUES_DISPLAY[a] || 0)
  );
}

function getMaterialScore(pieces: PieceSymbol[]): number {
  return pieces.reduce((sum, p) => sum + (PIECE_VALUES_DISPLAY[p] || 0), 0);
}

interface PieceRowProps {
  pieces: PieceSymbol[];
  color: 'w' | 'b';
  label: string;
}

function PieceRow({ pieces, color, label }: PieceRowProps) {
  const sorted = sortByValue(pieces);
  const score = getMaterialScore(pieces);

  if (pieces.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 w-16 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-0.5">
        {sorted.map((piece, i) => (
          <span
            key={i}
            className="text-lg leading-none"
            style={{
              textShadow: color === 'w'
                ? '0 0 3px rgba(0,0,0,0.8)'
                : '0 0 3px rgba(255,255,255,0.3)',
              filter: color === 'w' ? 'none' : 'brightness(0.7)',
            }}
            title={piece}
          >
            {getPieceUnicode(color, piece)}
          </span>
        ))}
      </div>
      {score > 0 && (
        <span className="text-xs text-zinc-400 font-mono">+{score}</span>
      )}
    </div>
  );
}

export function CapturedPiecesDisplay({ capturedPieces, perspective }: CapturedPiecesProps) {
  const whiteCaptured = capturedPieces.w as PieceSymbol[];
  const blackCaptured = capturedPieces.b as PieceSymbol[];

  const whiteScore = getMaterialScore(whiteCaptured);
  const blackScore = getMaterialScore(blackCaptured);
  const advantage = whiteScore - blackScore;

  return (
    <div className="space-y-1.5 p-3 bg-zinc-800/50 rounded-lg">
      <PieceRow pieces={whiteCaptured} color="b" label="White took" />
      <PieceRow pieces={blackCaptured} color="w" label="Black took" />
      {Math.abs(advantage) > 0 && (
        <div className="text-xs text-zinc-500 pt-1">
          {advantage > 0 ? 'White' : 'Black'} +{Math.abs(advantage)}
        </div>
      )}
    </div>
  );
}
