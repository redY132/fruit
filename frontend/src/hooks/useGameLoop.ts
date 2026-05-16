// requestAnimationFrame game tick
// TODO: drive fruit arc physics and collision detection each frame
export function useGameLoop(_callback: (dt: number) => void) {
  return { running: false };
}
