import { useRef } from "react";
import Webcam from "react-webcam";
import { useHandTracking } from "../hooks/useHandTracking";
import { HandOverlay } from "./HandOverlay";

interface Props {
  width: number;
  height: number;
}

const CustomWebcam = ({ width, height }: Props) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useHandTracking(webcamRef, canvasRef);

  return (
    <div style={{ position: "relative", width, height }}>
      <Webcam ref={webcamRef} width={width} height={height} mirrored />
      <HandOverlay ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default CustomWebcam;
