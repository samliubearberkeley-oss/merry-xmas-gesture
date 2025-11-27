import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results, NormalizedLandmarkList } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export type GestureState = 'OPEN' | 'PINCH' | 'FIST';

export interface HandData {
  landmarks: NormalizedLandmarkList | null;
  gesture: GestureState;
  palmCenter: { x: number; y: number } | null;
  isTracking: boolean;
}

export interface HandTrackingStats {
  fps: number;
  particleCount: number;
  streamRate: string;
  elapsedTime: string;
}

const detectGesture = (landmarks: NormalizedLandmarkList): GestureState => {
  // Landmark indices: 0=wrist, 4=thumb tip, 8=index tip, 12=middle tip, 16=ring tip, 20=pinky tip
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const palmBase = landmarks[0];

  // Calculate distance between thumb and index (pinch detection)
  const pinchDistance = Math.hypot(
    thumbTip.x - indexTip.x,
    thumbTip.y - indexTip.y
  );

  // Calculate average finger to wrist distance (fist detection)
  const fingerDistances = [indexTip, middleTip, ringTip, pinkyTip].map((tip) =>
    Math.hypot(tip.x - palmBase.x, tip.y - palmBase.y)
  );
  const avgFingerDistance = fingerDistances.reduce((a, b) => a + b, 0) / 4;

  // Pinch: thumb and index close together
  if (pinchDistance < 0.08) {
    return 'PINCH';
  }

  // Fist: all fingers close to wrist
  if (avgFingerDistance < 0.25) {
    return 'FIST';
  }

  // Default: open hand
  return 'OPEN';
};

export const useHandTracking = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean = true
) => {
  const [handData, setHandData] = useState<HandData>({
    landmarks: null,
    gesture: 'OPEN',
    palmCenter: null,
    isTracking: false,
  });

  const [stats, setStats] = useState<HandTrackingStats>({
    fps: 0,
    particleCount: 1800, // Total particle count
    streamRate: '0 MB/s',
    elapsedTime: '00:00:00',
  });

  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const startTimeRef = useRef(Date.now());
  const enabledRef = useRef(enabled);

  // Update enabled state
  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) {
      setHandData((prev) => ({ ...prev, landmarks: null, palmCenter: null, isTracking: false }));
    }
  }, [enabled]);

  const onResults = useCallback((results: Results) => {
    frameCountRef.current++;
    const now = Date.now();

    // Update FPS once per second
    if (now - lastTimeRef.current >= 1000) {
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');

      setStats((prev) => ({
        ...prev,
        fps: frameCountRef.current,
        elapsedTime: `${hours}:${minutes}:${seconds}`,
        streamRate: `${(Math.random() * 20 + 15).toFixed(2)} MB/s`,
      }));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const gesture = detectGesture(landmarks);

      // Calculate palm center (average of 0, 5, 9, 13, 17)
      const palmIndices = [0, 5, 9, 13, 17];
      const palmCenter = palmIndices.reduce(
        (acc, idx) => ({
          x: acc.x + landmarks[idx].x / palmIndices.length,
          y: acc.y + landmarks[idx].y / palmIndices.length,
        }),
        { x: 0, y: 0 }
      );

      setHandData({
        landmarks,
        gesture,
        palmCenter,
        isTracking: true,
      });
    } else {
      setHandData((prev) => ({ ...prev, landmarks: null, palmCenter: null, isTracking: false }));
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,  // Lower complexity (0=lite, 1=full)
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.4,
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    // Frame rate limiting
    let lastFrameTime = 0;
    const frameInterval = 1000 / 15; // Limit to 15 FPS

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        // Skip processing if disabled
        if (!enabledRef.current) {
          return;
        }

        const now = performance.now();
        // Frame skip: limit processing frequency
        if (now - lastFrameTime < frameInterval) {
          return;
        }
        lastFrameTime = now;

        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width: 320,  // Lower resolution
      height: 240,
    });

    camera.start();
    cameraRef.current = camera;

    return () => {
      camera.stop();
      hands.close();
    };
  }, [videoRef, onResults]);

  return { handData, stats };
};

