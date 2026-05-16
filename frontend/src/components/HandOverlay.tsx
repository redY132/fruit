import { useEffect, useRef } from "react";

interface Props {
  landmarks: { x: number; y: number; z: number }[][];
  width: number;
  height: number;
}

const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

export function HandOverlay({ landmarks, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (const hand of landmarks) {
      // draw bones
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      for (const [a, b] of CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(hand[a].x * width, hand[a].y * height);
        ctx.lineTo(hand[b].x * width, hand[b].y * height);
        ctx.stroke();
      }

      // draw joints
      for (const point of hand) {
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
      }
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    />
  );
}
