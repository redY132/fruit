import { useNavigate } from 'react-router';
import CustomWebcam from '../components/Webcam';

export function CameraTest() {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <CustomWebcam width={window.innerWidth} height={window.innerHeight} />

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 text-white bg-black/50 hover:bg-black/80 px-4 py-2 rounded-full font-bold text-sm transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
