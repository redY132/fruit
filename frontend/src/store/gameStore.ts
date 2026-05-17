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
  localScore: 0,
  comboCount: 0,
  lastSliceTime: 0,
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
  state.localScore = 0;
  state.comboCount = 0;
  state.lastSliceTime = 0;
}

export function getLocalScore(): number { return state.localScore; }
export function getCombo(): number { return state.comboCount; }

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
    fruit.update(dt, screen.h, now);
    if (fruit.alive && !fruit.sliced) {
      const sliceAngle = fruit.collidesWith(trailStore.points, trailStore.canvasW, trailStore.canvasH);
      if (sliceAngle !== null) {
        if (state.lastSliceTime > 0 && now - state.lastSliceTime > 500) {
          state.comboCount = 0;
        }
        if (fruit.type === 'bomb') {
          state.localScore += 250;
        } else {
          state.localScore += 10 + 3 * state.comboCount;
          state.comboCount += 1;
        }
        state.lastSliceTime = now;
        fruit.slice(sliceAngle, now);
      }
    }
  }

  // Remove dead fruits
  state.fruits = state.fruits.filter((f) => f.alive);

  return state.fruits;
}

export const gameStore = state;
