import type { SpawnEvent, GamePhase } from '../types/game';
import { Fruit } from '../game/Fruit';
import { trailStore } from './trailStore';

interface ScorePopup {
  x: number;
  y: number;
  points: number;
  startTime: number;
}

const POPUP_DURATION = 900; // ms

// Plain module singleton — RAF reads directly, no React re-renders in hot path
const state = {
  spawnQueue: [] as SpawnEvent[],
  fruits: [] as Fruit[],
  popups: [] as ScorePopup[],
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
  state.popups = [];
  state.phase = 'playing';
  state.localScore = 0;
  state.comboCount = 0;
  state.lastSliceTime = 0;
}

export function getLocalScore(): number { return state.localScore; }
export function getCombo(): number { return state.comboCount; }
export function getPopups(): ScorePopup[] { return state.popups; }

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
        let points: number;
        if (fruit.type === 'bomb') {
          points = 250;
        } else {
          state.comboCount += 1;
          points = 10 + 3 * state.comboCount;
        }
        state.localScore += points;
        state.popups.push({ x: fruit.x, y: fruit.y, points, startTime: now });
        fruit.slice(sliceAngle, now);
      }
    }
  }

  // Combo resets only when a non-bomb fruit falls off screen unsliced (a miss)
  for (const fruit of state.fruits) {
    if (!fruit.alive && !fruit.sliced && fruit.type !== 'bomb') {
      state.comboCount = 0;
    }
  }

  // Remove dead fruits and expired popups
  state.fruits = state.fruits.filter((f) => f.alive);
  state.popups = state.popups.filter((p) => now - p.startTime < POPUP_DURATION);

  return state.fruits;
}

export const gameStore = state;
