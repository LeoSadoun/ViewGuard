import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import modelLoader from '@/utils/modelLoader';

export interface DetectedPerson {
  bbox: [number, number, number, number]; // [x, y, width, height] in pixels
  score: number; // confidence 0-1
}

export const usePersonDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  isEnabled: boolean = true,
  detectionInterval: number = 300, // Detect every 300ms for more responsive tracking
  confidenceThreshold: number = 0.5 // Minimum confidence (0-1) to show detection
) => {
  const [detections, setDetections] = useState<DetectedPerson[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevDetectionsRef = useRef<DetectedPerson[]>([]);

  // Load the model once (using singleton loader)
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('🔵 [usePersonDetection] Starting to load model...');
        const model = await modelLoader.loadModel();
        modelRef.current = model;
        setIsModelLoaded(true);
        console.log('✅ [usePersonDetection] Model loaded and ready!');
      } catch (error) {
        console.error('❌ [usePersonDetection] Error loading COCO-SSD model:', error);
      }
    };

    loadModel();

    return () => {
      // Don't clear the model ref, keep it for reuse
    };
  }, []);

  // Run detection
  useEffect(() => {
    if (!isEnabled || !isModelLoaded || !videoRef.current || !modelRef.current) {
      return;
    }

    const video = videoRef.current;

    const detect = async () => {
      if (
        video.readyState === video.HAVE_ENOUGH_DATA &&
        modelRef.current &&
        !video.paused
      ) {
        try {
          const predictions = await modelRef.current.detect(video);

          // Filter for only people with sufficient confidence
          const people = predictions
            .filter((prediction) =>
              prediction.class === 'person' &&
              prediction.score >= confidenceThreshold
            )
            .map((prediction) => ({
              bbox: prediction.bbox,
              score: prediction.score,
            }));

          // Update immediately without smoothing
          setDetections(people);
          prevDetectionsRef.current = people;
        } catch (error) {
          console.error('❌ [Detection] Error:', error);
        }
      }
    };

    // Run detection periodically
    intervalRef.current = setInterval(detect, detectionInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, isModelLoaded, videoRef, detectionInterval, confidenceThreshold]);

  return { detections, isModelLoaded };
};
