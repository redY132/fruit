import { useEffect, useRef, RefObject } from 'react';
import type Webcam from 'react-webcam';
import { HandLandmarker } from '@mediapipe/tasks-vision';
import { initMediaPipe } from '../lib/mediapipe';

const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

const TRAIL_LENGTH = 20;

function draw(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number }[][],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);
  for (const hand of landmarks) {
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    for (const [a, b] of CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(hand[a].x * width, hand[a].y * height);
      ctx.lineTo(hand[b].x * width, hand[b].y * height);
      ctx.stroke();
    }
    for (const point of hand) {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(hand[8].x * width, hand[8].y * height);
    ctx.arc(hand[8].x * width, hand[8].y * height, 10, 0, 2 * Math.PI);
  }
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: { x: number; y: number }[],
  width: number,
  height: number,
) {
  if (trail.length < 2) return;
  for (let i = 1; i < trail.length; i++) {
    const t = i / trail.length;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1].x * width, trail[i - 1].y * height);
    ctx.lineTo(trail[i].x * width, trail[i].y * height);
    ctx.strokeStyle = `rgba(255, 255, 255, ${t})`;
    ctx.lineWidth = t * 8;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

export function useHandTracking(
  webcamRef: RefObject<Webcam>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const hadHandRef = useRef(false);
  const smoothedTipRef = useRef<{ x: number; y: number } | null>(null);
  const SMOOTHING = 0.5;

  useEffect(() => {
    initMediaPipe().then(lm => { landmarkerRef.current = lm; });
  }, []);

  useEffect(() => {
    let animId: number;

    function detect() {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (video && ctx && canvas && landmarkerRef.current && video.readyState >= 2) {
        const results = landmarkerRef.current.detectForVideo(video, Date.now());

        if (results.landmarks.length > 0) {
          const raw = { x: 1 - results.landmarks[0][8].x, y: results.landmarks[0][8].y };
          const prevSmoothed = smoothedTipRef.current ?? raw;
          const tip = {
            x: prevSmoothed.x * SMOOTHING + raw.x * (1 - SMOOTHING),
            y: prevSmoothed.y * SMOOTHING + raw.y * (1 - SMOOTHING),
          };
          smoothedTipRef.current = tip;
          const prev = trailRef.current[trailRef.current.length - 1];

          if (prev && hadHandRef.current) {
            const dx = tip.x - prev.x;
            const dy = tip.y - prev.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.max(1, Math.ceil(dist / 0.01));
            for (let i = 1; i <= steps; i++) {
              const t = i / steps;
              trailRef.current.push({ x: prev.x + dx * t, y: prev.y + dy * t });
            }
          } else {
            // jump to current point after a gap — no interpolation across missing frames
            trailRef.current.push(tip);
          }

          hadHandRef.current = true;

          if (trailRef.current.length > TRAIL_LENGTH)
            trailRef.current.splice(0, trailRef.current.length - TRAIL_LENGTH);
        } else {
          hadHandRef.current = false;
          smoothedTipRef.current = null;
        }

        const mirrored = results.landmarks.map(hand =>
          hand.map(pt => ({ ...pt, x: 1 - pt.x }))
        );
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTrail(ctx, trailRef.current, canvas.width, canvas.height);
        // draw(ctx, mirrored, canvas.width, canvas.height);
      }
      animId = requestAnimationFrame(detect);
    }

    animId = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animId);
  }, [webcamRef, canvasRef]);
}
