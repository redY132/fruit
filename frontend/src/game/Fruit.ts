import type { FruitType, SpawnEvent } from '../types/game';
import { GRAVITY, computeInitialVelocity } from '../utils/fruitPhysics';
import { getFruitImage } from './FruitAssets';

const FRUIT_SIZE = 80; // px, rendered square

const FRUIT_COLORS: Record<FruitType, string> = {
  apple:      '#e74c3c',
  orange:     '#e67e22',
  watermelon: '#27ae60',
  mango:      '#f1c40f',
  bomb:       '#2c3e50',
};

export class Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  alive: boolean;
  readonly type: FruitType;
  private image: HTMLImageElement | null;

  constructor(event: SpawnEvent, screen: { w: number; h: number }) {
    this.type = event.type;
    this.x = event.x * screen.w;
    this.y = screen.h + 60;
    this.angle = 0;
    this.angularVelocity = (Math.random() - 0.5) * 4; // rad/s
    this.alive = true;

    try {
      this.image = getFruitImage(event.type);
    } catch {
      this.image = null;
    }

    const { vx0, vy0 } = computeInitialVelocity(event.arc_height, event.x, screen);
    this.vx = vx0;
    this.vy = vy0;
  }

  collidesWith(trail: { x: number; y: number }[], screen: { w: number; h: number }): boolean {
    const r = FRUIT_SIZE / 2;
    for (let i = 1; i < trail.length; i++) {
      const ax = trail[i - 1].x * screen.w;
      const ay = trail[i - 1].y * screen.h;
      const bx = trail[i].x * screen.w;
      const by = trail[i].y * screen.h;

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
        if (nearX * nearX + nearY * nearY <= r * r) return true;
      }
    }
    return false;
  }

  update(dt: number, screenH: number): void {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += this.angularVelocity * dt;

    if (this.y > screenH + 120) {
      this.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.image) {
      ctx.drawImage(this.image, -FRUIT_SIZE / 2, -FRUIT_SIZE / 2, FRUIT_SIZE, FRUIT_SIZE);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, FRUIT_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = FRUIT_COLORS[this.type];
      ctx.fill();
    }

    ctx.restore();
  }
}
