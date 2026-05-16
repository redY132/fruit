import React from 'react';

interface GameCanvasProps {
  bombWarning?: boolean;
  children?: React.ReactNode;
}

export function GameCanvas({ bombWarning = false, children }: GameCanvasProps) {
  return (
    <div
      className={`w-full h-screen bg-[#050810] relative overflow-hidden font-sans ${
        bombWarning ? 'border-[6px] border-destructive' : ''
      }`}
    >
      {/* Webcam feed placeholder — replaced by MediaPipe canvas in useHandTracking */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />

      {children}
    </div>
  );
}
