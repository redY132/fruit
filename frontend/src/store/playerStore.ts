import type { Player } from '../types/player';

// Stub — local player state, updated via WebSocket events
export const playerStore = {
  local: null as Player | null,
  opponents: [] as Player[],
};
