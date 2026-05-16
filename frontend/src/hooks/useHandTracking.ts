// MediaPipe GestureRecognizer setup + landmark stream
// TODO: wire up @mediapipe/tasks-vision GestureRecognizer, feed landmarks to sliceDetection
export function useHandTracking() {
  return { landmarks: null };
}
