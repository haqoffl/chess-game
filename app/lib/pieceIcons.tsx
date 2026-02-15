// SVG chess piece icons as React components
// Using Unicode chess symbols with SVG for crisp rendering

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

const PIECE_UNICODE: Record<PieceColor, Record<PieceSymbol, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

export function getPieceUnicode(color: PieceColor, piece: PieceSymbol): string {
  return PIECE_UNICODE[color][piece] || '';
}

export const PIECE_VALUES_DISPLAY: Record<PieceSymbol, number> = {
  q: 9,
  r: 5,
  b: 3,
  n: 3,
  p: 1,
  k: 0,
};

export function getPieceName(piece: PieceSymbol): string {
  const names: Record<PieceSymbol, string> = {
    k: 'King',
    q: 'Queen',
    r: 'Rook',
    b: 'Bishop',
    n: 'Knight',
    p: 'Pawn',
  };
  return names[piece] || '';
}
