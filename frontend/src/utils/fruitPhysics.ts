// Arc trajectory math (spawn → fall)
// TODO: compute parabolic arc given spawn x position and gravity constant
export function computeArc(_spawnX: number, _t: number): { x: number; y: number } {
  return { x: _spawnX, y: _t * 9.8 };
}
