'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Difficulty } from '../types/chess';

interface StockfishHook {
  isReady: boolean;
  getBestMove: (fen: string, onMove: (move: string) => void) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  stop: () => void;
}

const SKILL_LEVELS: Record<Difficulty, number> = {
  easy: 3,
  medium: 10,
  hard: 20,
};

const DEPTH_LIMITS: Record<Difficulty, number> = {
  easy: 2,
  medium: 8,
  hard: 18,
};

const MOVE_TIME_MS: Record<Difficulty, number> = {
  easy: 200,
  medium: 800,
  hard: 2000,
};

export function useStockfish(): StockfishHook {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const difficultyRef = useRef<Difficulty>('medium');
  const moveCallbackRef = useRef<((move: string) => void) | null>(null);
  const isReadyRef = useRef(false);

  useEffect(() => {
    // Try to load Stockfish Web Worker
    try {
      const worker = new Worker('/stockfish/stockfish-worker.js');

      worker.onmessage = (e) => {
        const { type, data } = e.data;

        if (type === 'error') {
          console.warn('Stockfish error, will use minimax fallback:', data);
          setIsReady(false);
          return;
        }

        if (type === 'message') {
          const message = data as string;

          if (message === 'readyok' || message.startsWith('uciok')) {
            if (!isReadyRef.current) {
              isReadyRef.current = true;
              setIsReady(true);
            }
          }

          // Parse best move
          if (message.startsWith('bestmove') && moveCallbackRef.current) {
            const parts = message.split(' ');
            const move = parts[1];
            if (move && move !== '(none)') {
              const cb = moveCallbackRef.current;
              moveCallbackRef.current = null;
              cb(move);
            }
          }
        }
      };

      worker.onerror = (e) => {
        console.warn('Stockfish worker error:', e.message);
        setIsReady(false);
      };

      // Initialize the worker
      worker.postMessage({ type: 'init' });
      workerRef.current = worker;
    } catch (e) {
      console.warn('Could not create Stockfish worker:', e);
      setIsReady(false);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const sendCommand = useCallback((command: string) => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'command', data: command });
    }
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    difficultyRef.current = difficulty;
    const skillLevel = SKILL_LEVELS[difficulty];
    sendCommand(`setoption name Skill Level value ${skillLevel}`);
  }, [sendCommand]);

  const getBestMove = useCallback((fen: string, onMove: (move: string) => void) => {
    if (!isReadyRef.current || !workerRef.current) {
      // Fallback: use minimax in a setTimeout to avoid blocking
      const difficulty = difficultyRef.current;
      setTimeout(() => {
        import('../lib/minimax').then(({ getBestMove: minimaxGetBestMove, getDepthForDifficulty }) => {
          const depth = getDepthForDifficulty(difficulty);
          const move = minimaxGetBestMove(fen, depth);
          if (move) onMove(move);
        });
      }, 100);
      return;
    }

    moveCallbackRef.current = onMove;
    const difficulty = difficultyRef.current;
    const depth = DEPTH_LIMITS[difficulty];
    const moveTime = MOVE_TIME_MS[difficulty];

    sendCommand(`position fen ${fen}`);
    sendCommand(`go depth ${depth} movetime ${moveTime}`);
  }, [sendCommand]);

  const stop = useCallback(() => {
    sendCommand('stop');
    moveCallbackRef.current = null;
  }, [sendCommand]);

  return { isReady, getBestMove, setDifficulty, stop };
}
