import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { useHandTracking } from '../hooks/useHandTracking';
import { HandOverlay } from './HandOverlay';

interface GameCanvasProps {
  bombWarning?: boolean;
  children?: React.ReactNode;
}

export function GameCanvas({ bombWarning = false, children }: GameCanvasProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useHandTracking(webcamRef, canvasRef);

  return (
    <div
      className={`w-full h-screen relative overflow-hidden font-sans ${
        bombWarning ? 'border-[6px] border-destructive' : ''
      }`}
    >
      {/* Full-screen webcam feed */}
      <Webcam
        ref={webcamRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        mirrored
      />

      {/* Trail + hand skeleton overlay — full viewport dimensions */}
      <HandOverlay
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* Dark scrim so UI elements stay readable over the webcam */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {children}
    </div>
  );
}
