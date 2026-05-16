import { forwardRef } from "react";

interface Props {
  width: number;
  height: number;
}

export const HandOverlay = forwardRef<HTMLCanvasElement, Props>(
  ({ width, height }, ref) => (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    />
  )
);
