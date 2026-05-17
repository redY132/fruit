import React, { useRef } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import CustomWebcam from './Webcam';

interface GameCanvasProps {
  bombWarning?: boolean;
  onBomb?: () => void;
  children?: React.ReactNode;
}

export function GameCanvas({ bombWarning = false, onBomb, children }: GameCanvasProps) {
  const fruitCanvasRef = useRef<HTMLCanvasElement>(null);
  const screen = { w: window.innerWidth, h: window.innerHeight };

  useGameLoop(fruitCanvasRef, screen);

  return (
    <div
      className={`w-full h-screen relative overflow-hidden font-sans ${
        bombWarning ? 'border-[6px] border-destructive' : ''
      }`}
    >
      {/* Full-screen webcam feed with hand tracking */}
      <div className="absolute inset-0">
        <CustomWebcam
          width={window.innerWidth}
          height={window.innerHeight}
          onBomb={onBomb}
        />
      </div>

      {/* Fruit physics canvas — above webcam and hand overlay */}
      <canvas
        ref={fruitCanvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Dark scrim so UI elements stay readable over the webcam */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {children}
    </div>
  );
}
