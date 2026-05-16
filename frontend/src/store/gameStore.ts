import type { FruitQueue, GamePhase } from '../types/game';

// Stub — wired to WebSocket + backend in useWebSocket hook
export const gameStore = {
  fruitQueue: null as FruitQueue | null,
  phase: 'lobby' as GamePhase,
};
