// Arc trajectory math — pure math only, no canvas, no classes
export const GRAVITY = 1800; // px/s²

export function computeInitialVelocity(
  arc_height: number,
  spawnX: number,
  screen: { w: number; h: number }
): { vx0: number; vy0: number } {
  const vy0 = -Math.sqrt(2 * GRAVITY * arc_height * screen.h);
  const vx0 = (0.5 - spawnX) * screen.w * 0.5;
  return { vx0, vy0 };
}
