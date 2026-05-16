import { useEffect, useRef, useState, RefObject } from 'react';
import type Webcam from 'react-webcam';
import { HandLandmarker } from '@mediapipe/tasks-vision';
import { initMediaPipe } from '../lib/mediapipe';

export function useHandTracking(webcamRef: RefObject<Webcam>) {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const [landmarks, setLandmarks] = useState<{ x: number; y: number; z: number }[][]>([]);

  useEffect(() => {
    initMediaPipe().then(lm => { landmarkerRef.current = lm; });
  }, []);

  useEffect(() => {
    let animId: number;

    function detect() {
      const video = webcamRef.current?.video;
      if (video && landmarkerRef.current && video.readyState >= 2) {
        const results = landmarkerRef.current.detectForVideo(video, Date.now());
        setLandmarks(results.landmarks);
      }
      animId = requestAnimationFrame(detect);
    }

    animId = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animId);
  }, [webcamRef]);

  return { landmarks };
}
