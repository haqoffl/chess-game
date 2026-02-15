# Platform Architect Memory

## Project: Chess AI App (ai-demo)

### Stack
- Next.js 16 (Turbopack by default — do NOT use webpack config)
- TypeScript, Tailwind CSS v4
- chess.js v1.4 for game logic
- react-chessboard v5 (major API change: all props go inside `options` object)
- Stockfish v18 (WASM, served from /public/stockfish/)
- Framer Motion v12 for animations

### Key Architecture Decisions
- Stockfish runs in a Web Worker (`/public/stockfish/stockfish-worker.js`)
- Minimax AI (app/lib/minimax.ts) as fallback when Stockfish unavailable
- COEP/COOP headers required for SharedArrayBuffer used by Stockfish WASM
- Chess engine state managed via `useChessGame` hook with chess.js under a ref

### react-chessboard v5 API
```tsx
<Chessboard options={{
  position: fen,
  boardOrientation: 'white' | 'black',
  squareStyles: Record<string, CSSProperties>,
  onSquareClick: ({ piece, square }) => void,
  onPieceDrop: ({ piece, sourceSquare, targetSquare }) => boolean,
  onPieceClick: ({ isSparePiece, piece, square }) => void,
  allowDragging: boolean,
  animationDurationInMs: number,
  darkSquareStyle: CSSProperties,
  lightSquareStyle: CSSProperties,
}} />
```

### Common Pitfalls
- `create-next-app` fails if `.claude/` directory exists — scaffold in /tmp and copy
- Next.js 16 Turbopack: don't add `webpack` config key, use `turbopack: {}`
- Stockfish npm package files live in `node_modules/stockfish/bin/`, must be copied to `/public/`
- TypeScript bin path broken — use `node node_modules/typescript/lib/_tsc.js --noEmit`
- Destructure hooks return values to get stable function references for useEffect deps

### Project Structure
```
app/
  types/chess.ts       — shared TypeScript types
  lib/minimax.ts       — minimax with alpha-beta pruning
  lib/pieceIcons.tsx   — chess piece unicode helpers
  hooks/useStockfish.ts — Stockfish Web Worker hook
  hooks/useChessGame.ts — main game state hook
  components/          — all React UI components
public/stockfish/      — Stockfish WASM + worker files
```
