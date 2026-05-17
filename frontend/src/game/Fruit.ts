import type { FruitType, SpawnEvent } from '../types/game';
import { GRAVITY, computeInitialVelocity } from '../utils/fruitPhysics';
import { getFruitImage } from './FruitAssets';

const FRUIT_SIZE = 80; // px, rendered square
const SLICE_DURATION = 500; // ms — how long the sliced halves are visible
const SLASH_DURATION = 280; // ms — how long the slash line lingers
const SPREAD_SPEED = 200; // px/s — how fast halves fly apart

const BOMB_COLOR = '#2c3e50';
const DEFAULT_COLOR = '#e67e22';

export class Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  alive: boolean;
  sliced: boolean;
  readonly type: FruitType;
  private image: HTMLImageElement | null;

  private sliceAngle: number;
  private sliceTime: number;
  private half1: { x: number; y: number; vx: number; vy: number };
  private half2: { x: number; y: number; vx: number; vy: number };

  constructor(event: SpawnEvent, screen: { w: number; h: number }) {
    this.type = event.type;
    this.x = event.x * screen.w;
    this.y = screen.h + 60;
    this.angle = 0;
    this.angularVelocity = (Math.random() - 0.5) * 4; // rad/s
    this.alive = true;
    this.sliced = false;
    this.sliceAngle = 0;
    this.sliceTime = 0;
    this.half1 = { x: 0, y: 0, vx: 0, vy: 0 };
    this.half2 = { x: 0, y: 0, vx: 0, vy: 0 };

    this.image = getFruitImage(event.type);

    const { vx0, vy0 } = computeInitialVelocity(event.arc_height, event.x, screen);
    this.vx = vx0;
    this.vy = vy0;
  }

  slice(sliceAngle: number, now: number): void {
    this.sliced = true;
    this.sliceAngle = sliceAngle;
    this.sliceTime = now;
    // Halves fly apart perpendicular to the cut direction
    const perpX = -Math.sin(sliceAngle);
    const perpY = Math.cos(sliceAngle);
    this.half1 = { x: 0, y: 0, vx: perpX * SPREAD_SPEED, vy: perpY * SPREAD_SPEED - 100 };
    this.half2 = { x: 0, y: 0, vx: -perpX * SPREAD_SPEED, vy: -perpY * SPREAD_SPEED - 100 };
  }

  // Returns the slice angle (radians) if the trail intersects this fruit, otherwise null
  collidesWith(trail: { x: number; y: number }[], canvasW: number, canvasH: number): number | null {
    const r = FRUIT_SIZE / 2;
    for (let i = 1; i < trail.length; i++) {
      const ax = trail[i - 1].x * canvasW;
      const ay = trail[i - 1].y * canvasH;
      const bx = trail[i].x * canvasW;
      const by = trail[i].y * canvasH;

      const dx = bx - ax;
      const dy = by - ay;
      const fx = ax - this.x;
      const fy = ay - this.y;

      const a = dx * dx + dy * dy;
      const b = 2 * (fx * dx + fy * dy);
      const c = fx * fx + fy * fy - r * r;
      const disc = b * b - 4 * a * c;

      if (disc >= 0 && a > 0) {
        const t = Math.max(0, Math.min(1, -b / (2 * a)));
        const nearX = ax + t * dx - this.x;
        const nearY = ay + t * dy - this.y;
        if (nearX * nearX + nearY * nearY <= r * r) {
          return Math.atan2(dy, dx);
        }
      }
    }
    return null;
  }

  update(dt: number, screenH: number, now: number): void {
    if (this.sliced) {
      if (now - this.sliceTime > SLICE_DURATION) {
        this.alive = false;
        return;
      }
      // Halves fall under gravity and fly apart
      this.half1.vy += GRAVITY * dt;
      this.half2.vy += GRAVITY * dt;
      this.half1.x += this.half1.vx * dt;
      this.half1.y += this.half1.vy * dt;
      this.half2.x += this.half2.vx * dt;
      this.half2.y += this.half2.vy * dt;
      return;
    }

    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += this.angularVelocity * dt;

    if (this.y > screenH + 120) {
      this.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D, now: number): void {
    if (this.sliced) {
      this.drawSliced(ctx, now);
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.image) {
      ctx.drawImage(this.image, -FRUIT_SIZE / 2, -FRUIT_SIZE / 2, FRUIT_SIZE, FRUIT_SIZE);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, FRUIT_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = this.type === 'bomb' ? BOMB_COLOR : DEFAULT_COLOR;
      ctx.fill();
    }

    ctx.restore();
  }

  private drawSliced(ctx: CanvasRenderingContext2D, now: number): void {
    const elapsed = now - this.sliceTime;
    const alpha = Math.max(0, 1 - elapsed / SLICE_DURATION);

    this.drawHalf(ctx, this.half1.x, this.half1.y, 1, alpha);
    this.drawHalf(ctx, this.half2.x, this.half2.y, -1, alpha);

    // Slash line through the original center, fades out faster than the halves
    if (elapsed < SLASH_DURATION) {
      const slashAlpha = (1 - elapsed / SLASH_DURATION) * 0.95;
      const cosA = Math.cos(this.sliceAngle);
      const sinA = Math.sin(this.sliceAngle);
      const slashLen = FRUIT_SIZE * 0.85;
      ctx.save();
      ctx.globalAlpha = slashAlpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(this.x - cosA * slashLen, this.y - sinA * slashLen);
      ctx.lineTo(this.x + cosA * slashLen, this.y + sinA * slashLen);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Draws one half of the fruit: the image clipped to one side of the cut line,
  // translated to the half's current offset position.
  private drawHalf(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    perpSign: number,
    alpha: number
  ): void {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Move to the half's current screen position
    ctx.translate(this.x + offsetX, this.y + offsetY);
    // Rotate to match the fruit's frozen rotation at slice time
    ctx.rotate(this.angle);

    // Clip to the correct side of the cut line in image-local space.
    // The cut passes through the image center (0,0) in world space; in local
    // (rotated) space the cut angle is sliceAngle - this.angle.
    const localAngle = this.sliceAngle - this.angle;
    const cosA = Math.cos(localAngle);
    const sinA = Math.sin(localAngle);
    const perpX = -sinA * perpSign;
    const perpY = cosA * perpSign;
    const big = FRUIT_SIZE * 3;

    ctx.beginPath();
    ctx.moveTo(cosA * big, sinA * big);
    ctx.lineTo(-cosA * big, -sinA * big);
    ctx.lineTo(-cosA * big + perpX * big, -sinA * big + perpY * big);
    ctx.lineTo(cosA * big + perpX * big, sinA * big + perpY * big);
    ctx.closePath();
    ctx.clip();

    // Draw the image centered at the origin (image center), exactly as in the normal draw
    if (this.image) {
      ctx.drawImage(this.image, -FRUIT_SIZE / 2, -FRUIT_SIZE / 2, FRUIT_SIZE, FRUIT_SIZE);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, FRUIT_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = this.type === 'bomb' ? BOMB_COLOR : DEFAULT_COLOR;
      ctx.fill();
    }

    ctx.restore();
  }
}
