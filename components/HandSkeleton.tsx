import React, { useRef, useEffect } from 'react';
import { NormalizedLandmarkList } from '@mediapipe/hands';

interface HandSkeletonProps {
  landmarks: NormalizedLandmarkList | null;
  width: number;
  height: number;
}

// MediaPipe hand connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17],             // Palm
];

export const HandSkeleton: React.FC<HandSkeletonProps> = ({
  landmarks,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!landmarks) return;

    // Draw connections
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    HAND_CONNECTIONS.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      ctx.beginPath();
      ctx.moveTo(startPoint.x * width, startPoint.y * height);
      ctx.lineTo(endPoint.x * width, endPoint.y * height);
      ctx.stroke();
    });

    // Draw joints
    landmarks.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;

      // Fingertips use larger red dots
      const isFingertip = [4, 8, 12, 16, 20].includes(index);

      ctx.beginPath();
      ctx.arc(x, y, isFingertip ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isFingertip ? '#ff3040' : '#ffffff';
      ctx.fill();

      // Glow effect
      if (isFingertip) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 48, 64, 0.3)';
        ctx.fill();
      }
    });
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none z-15"
      style={{ transform: 'scaleX(-1)' }}
    />
  );
};

