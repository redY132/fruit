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
            const text = popup.points < 0 ? `${popup.points}` : `+${popup.points}`;
            const fontSize = 26;
            ctx.font = `bold ${fontSize}px "Baloo Bhaijaan 2", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const grad = ctx.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
            if (popup.points < 0) {
              grad.addColorStop(0, '#C04040');
              grad.addColorStop(1, '#F08080');
            } else {
              grad.addColorStop(0, '#C07878');
              grad.addColorStop(1, '#F8E0E0');
            }
            ctx.shadowColor = 'rgba(0,0,0,0.65)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 3;
            ctx.strokeStyle = 'rgba(20,15,15,0.85)';
            ctx.lineWidth = 1;
            ctx.strokeText(text, 0, 0);
            ctx.fillStyle = grad;
            ctx.fillText(text, 0, 0);
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
