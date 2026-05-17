import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import CustomWebcam from '../components/Webcam';

export function CameraTest() {
  const navigate = useNavigate();
  const [bombMessage, setBombMessage] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBomb = useCallback(() => {
    setBombMessage(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setBombMessage(false), 1500);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <CustomWebcam width={window.innerWidth} height={window.innerHeight} onBomb={handleBomb} />

      {bombMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-white text-6xl font-black tracking-widest animate-ping select-none">
            💣 BOMB SENT
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 text-white bg-black/50 hover:bg-black/80 px-4 py-2 rounded-full font-bold text-sm transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
