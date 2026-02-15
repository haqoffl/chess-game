// Stockfish Web Worker
// This worker loads Stockfish and forwards messages between the main thread and the engine

let stockfish = null;
let isReady = false;
const messageQueue = [];

async function initStockfish() {
  try {
    importScripts('/stockfish/stockfish-18-lite-single.js');

    stockfish = await Stockfish();

    stockfish.addMessageListener((message) => {
      self.postMessage({ type: 'message', data: message });

      if (message === 'readyok') {
        isReady = true;
        // Flush queued messages
        while (messageQueue.length > 0) {
          stockfish.postMessage(messageQueue.shift());
        }
      }
    });

    // Initialize UCI
    stockfish.postMessage('uci');
    stockfish.postMessage('isready');

  } catch (error) {
    self.postMessage({ type: 'error', data: error.message });
  }
}

self.onmessage = function(e) {
  const { type, data } = e.data;

  if (type === 'init') {
    initStockfish();
    return;
  }

  if (type === 'command') {
    if (stockfish) {
      if (isReady) {
        stockfish.postMessage(data);
      } else {
        messageQueue.push(data);
      }
    } else {
      messageQueue.push(data);
    }
  }
};
