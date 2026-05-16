import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import modelUrl from './models/hand_landmarker.task?url';

export async function initMediaPipe(): Promise<HandLandmarker> {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );
    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        runningMode: 'VIDEO',
        baseOptions: {
            modelAssetPath: modelUrl,
        },
        numHands: 2,
    });
    return handLandmarker;
}
