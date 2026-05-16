export type FruitType = 'apple' | 'orange' | 'watermelon' | 'mango' | 'bomb';

export interface SpawnEvent {
  id: string;
  type: FruitType;
  spawnAt: number;
  x: number;
}

export interface FruitQueue {
  track: string;
  events: SpawnEvent[];
}

export type GamePhase = 'lobby' | 'countdown' | 'playing' | 'results';
