import type { SpawnEvent, GamePhase } from '../types/game';
import { Fruit } from '../game/Fruit';
import { trailStore } from './trailStore';

// Plain module singleton — RAF reads directly, no React re-renders in hot path
const state = {
  spawnQueue: [] as SpawnEvent[],
  fruits: [] as Fruit[],
  matchStartTime: null as number | null,
  phase: 'lobby' as GamePhase,
  lastTick: 0,
};

export function setSpawnQueue(queue: SpawnEvent[]): void {
  state.spawnQueue = [...queue].sort((a, b) => a.spawnAt - b.spawnAt);
}

export function setPhase(phase: GamePhase): void {
  state.phase = phase;
}

export function startMatch(now: number): void {
  state.matchStartTime = now;
  state.lastTick = now;
  state.fruits = [];
  state.phase = 'playing';
}

export function tick(now: number, screen: { w: number; h: number }): Fruit[] {
  const dt = Math.min((now - state.lastTick) / 1000, 0.1);
  state.lastTick = now;

  if (state.phase !== 'playing' || state.matchStartTime === null) {
    return state.fruits;
  }

  const elapsed = now - state.matchStartTime;

  // Spawn fruits whose time has come
  while (state.spawnQueue.length > 0 && state.spawnQueue[0].spawnAt <= elapsed) {
    const event = state.spawnQueue.shift()!;
    state.fruits.push(new Fruit(event, screen));
  }

  // Update each fruit and check trail collisions
  for (const fruit of state.fruits) {
    fruit.update(dt, screen.h);
    if (fruit.alive && fruit.collidesWith(trailStore.points, screen)) {
      fruit.alive = false;
    }
  }

  // Remove dead fruits
  state.fruits = state.fruits.filter((f) => f.alive);

  return state.fruits;
}

export const gameStore = state;
