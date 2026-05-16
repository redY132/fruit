// Corner zone hit-detection for shop purchases
// TODO: check if hand landmark position falls within a 160×160 corner bounding box
export function hitTestTriggerZone(
  _x: number,
  _y: number,
  _position: 'tl' | 'tr' | 'bl' | 'br',
  _canvasWidth: number,
  _canvasHeight: number,
): boolean {
  return false;
}
