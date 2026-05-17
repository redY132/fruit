export type FruitType = string;

export interface SpawnEvent {
  id: string;
  type: FruitType;
  spawnAt: number;
  x: number;
  arc_height: number;
}

export interface ActiveFruit {
  id: string;
  spawnedAt: number;
  event: SpawnEvent;
}

export interface FruitQueue {
  track: string;
  events: SpawnEvent[];
}

export type GamePhase = 'lobby' | 'countdown' | 'playing' | 'results';
