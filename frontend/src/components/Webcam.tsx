import { useRef } from "react";
import Webcam from "react-webcam";
import { useHandTracking } from "../hooks/useHandTracking";
import { HandOverlay } from "./HandOverlay";

const WIDTH = 600;
const HEIGHT = 600;

const CustomWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const { landmarks } = useHandTracking(webcamRef);

  return (
    <div style={{ position: "relative", width: WIDTH, height: HEIGHT }}>
      <Webcam ref={webcamRef} width={WIDTH} height={HEIGHT} />
      <HandOverlay landmarks={landmarks} width={WIDTH} height={HEIGHT} />
    </div>
  );
};

export default CustomWebcam;
