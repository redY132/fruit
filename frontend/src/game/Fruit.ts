import type { FruitType, SpawnEvent } from '../types/game';
import { GRAVITY, computeInitialVelocity } from '../utils/fruitPhysics';
import { getFruitImage } from './FruitAssets';

const FRUIT_SIZE = 80; // px, rendered square

export class Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  alive: boolean;
  readonly type: FruitType;
  private image: HTMLImageElement;

  constructor(event: SpawnEvent, screen: { w: number; h: number }) {
    this.type = event.type;
    this.x = event.x * screen.w;
    this.y = screen.h + 60;
    this.angle = 0;
    this.angularVelocity = (Math.random() - 0.5) * 4; // rad/s
    this.alive = true;
    this.image = getFruitImage(event.type);

    const { vx0, vy0 } = computeInitialVelocity(event.arc_height, event.x, screen);
    this.vx = vx0;
    this.vy = vy0;
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
    ctx.drawImage(this.image, -FRUIT_SIZE / 2, -FRUIT_SIZE / 2, FRUIT_SIZE, FRUIT_SIZE);
    ctx.restore();
  }
}
