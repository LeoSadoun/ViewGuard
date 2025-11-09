import { useEffect, useRef, useState } from 'react';
import { getEventAtTime, getRandomConfidence, EventAnnotation } from '@/config/eventAnnotations';
import { Detection } from '@/components/CCTVTile';

interface UseEventDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoSrc: string;
  enabled?: boolean;
}

interface EventDetectionResult {
  detection: Detection | null;
  shouldTrigger: boolean;
  videoTimestamp: number; // Timestamp in the video when event occurred
}

export const useEventDetection = ({
  videoRef,
  videoSrc,
  enabled = true,
}: UseEventDetectionProps): EventDetectionResult => {
  const [detection, setDetection] = useState<Detection | null>(null);
  const [shouldTrigger, setShouldTrigger] = useState(false);
  const [videoTimestamp, setVideoTimestamp] = useState(0);
  const triggeredEvents = useRef<Set<string>>(new Set());
  const currentVideoRef = useRef<string>('');

  // Reset triggered events when video changes
  useEffect(() => {
    if (videoSrc !== currentVideoRef.current) {
      triggeredEvents.current.clear();
      setDetection(null);
      setShouldTrigger(false);
      currentVideoRef.current = videoSrc;
    }
  }, [videoSrc]);

  useEffect(() => {
    if (!enabled || !videoRef.current) {
      return;
    }

    const video = videoRef.current;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;

      // Check if there's an event at this timestamp
      const event = getEventAtTime(videoSrc, currentTime);

      if (event) {
        // Create a unique key for this event
        const eventKey = `${event.videoName}-${event.timestamp}`;

        // Only trigger if we haven't triggered this event before
        if (!triggeredEvents.current.has(eventKey)) {
          triggeredEvents.current.add(eventKey);

          // Generate random confidence within the specified range
          const confidence = getRandomConfidence(event.minConfidence, event.maxConfidence);

          // Generate random position for the bounding box (will be overlaid on person later)
          const x = Math.random() * 60 + 10; // 10-70% from left
          const y = Math.random() * 60 + 10; // 10-70% from top
          const width = Math.random() * 15 + 15; // 15-30% width
          const height = Math.random() * 20 + 20; // 20-40% height

          const newDetection: Detection = {
            type: event.type,
            confidence,
            timestamp: new Date().toISOString(),
            x,
            y,
            width,
            height,
          };

          setDetection(newDetection);
          setShouldTrigger(true);
          setVideoTimestamp(currentTime); // Store the video timestamp

          console.log(`🚨 [EventDetection] Event triggered: ${event.type} at ${event.timestamp}s with ${confidence}% confidence`);

          // Clear detection after 8 seconds (same as original system)
          setTimeout(() => {
            setDetection(null);
            setShouldTrigger(false);
          }, 8000);
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, videoSrc, enabled]);

  return { detection, shouldTrigger, videoTimestamp };
};
