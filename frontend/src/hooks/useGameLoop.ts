import { useEffect, RefObject } from 'react';
import { tick } from '../store/gameStore';

// requestAnimationFrame game tick — drives fruit physics and canvas draw each frame
export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement>,
  screen: { w: number; h: number }
) {
  useEffect(() => {
    let rafId: number;

    function loop(now: number) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const fruits = tick(now, screen);
          for (const fruit of fruits) {
            fruit.draw(ctx);
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [canvasRef, screen.w, screen.h]);
}
