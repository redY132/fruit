import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useHandTracking } from "../hooks/useHandTracking";
import { HandOverlay } from "./HandOverlay";

interface Props {
  width: number;
  height: number;
  onBomb?: () => void;
}

const CustomWebcam = ({ width, height, onBomb }: Props) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [actualSize, setActualSize] = useState({ width, height });

  useEffect(() => {
    const video = webcamRef.current?.video;
    if (!video) return;

    const observer = new ResizeObserver(() => {
      setActualSize({ width: video.clientWidth, height: video.clientHeight });
    });

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useHandTracking(webcamRef, canvasRef, onBomb);

  return (
    <div style={{ position: "relative", width, height }}>
      <Webcam ref={webcamRef} width={width} height={height} mirrored />
      <HandOverlay ref={canvasRef} width={actualSize.width} height={actualSize.height} />
    </div>
  );
};

export default CustomWebcam;
