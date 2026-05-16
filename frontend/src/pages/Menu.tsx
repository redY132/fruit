import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import CustomWebcam from '../components/Webcam';

export function Menu() {
  const navigate = useNavigate();
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div className="flex flex-col items-center text-center max-w-[320px] w-full z-10">
        <h1 className="text-6xl font-black text-white tracking-tighter mb-2 uppercase italic">
          Fruity
        </h1>
        <p className="text-muted text-lg mb-12 lowercase tracking-wide">
          multiplayer fruit ninja
        </p>

        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => navigate('/lobby')}
            className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95"
          >
            Create lobby
          </button>

          <button
            onClick={() => navigate('/lobby')}
            className="w-full bg-transparent text-white border-2 border-border py-4 rounded-full font-bold text-lg hover:border-white transition-colors active:scale-95"
          >
            Join lobby
          </button>

          <button className="w-full bg-transparent text-white border-2 border-border py-4 rounded-full font-bold text-lg hover:border-white transition-colors active:scale-95">
            How to play
          </button>

          <button
            onClick={() => setCameraOpen(true)}
            className="w-full bg-transparent text-muted py-4 rounded-full font-bold text-lg hover:text-white transition-colors active:scale-95"
          >
            Test Camera
          </button>
        </div>
      </div>

      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Camera Test</DialogTitle>
          </DialogHeader>
          <CustomWebcam />
        </DialogContent>
      </Dialog>

      <div className="absolute bottom-8 text-muted text-sm tracking-wide">
        camera access required to play
      </div>
    </div>
  );
}
