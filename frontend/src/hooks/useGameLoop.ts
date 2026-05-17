import { useEffect, RefObject } from 'react';
import { tick, getPopups } from '../store/gameStore';

const POPUP_DURATION = 900;

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
            fruit.draw(ctx, now);
          }
          // Floating score popups
          for (const popup of getPopups()) {
            const t = (now - popup.startTime) / POPUP_DURATION;
            const alpha = 1 - t;
            const yOffset = t * 70;
            const scale = 1 + (1 - t) * 0.4; // starts 1.4× and shrinks to 1×
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(popup.x, popup.y - yOffset);
            ctx.scale(scale, scale);
            ctx.font = 'bold 26px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 6;
            ctx.fillStyle = popup.points >= 250 ? '#ff6b35' : '#FFD700';
            ctx.fillText(`+${popup.points}`, 0, 0);
            ctx.restore();
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [canvasRef, screen.w, screen.h]);
}
