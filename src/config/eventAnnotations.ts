// Event annotations for videos - timestamps when events occur
// These are detected by our AI system and trigger notifications + colored boxes

export interface EventAnnotation {
  videoName: string;
  timestamp: number; // seconds
  type: "THEFT" | "FIGHT" | "VANDALISM";
  minConfidence: number;
  maxConfidence: number;
}

// All event annotations across videos
export const eventAnnotations: EventAnnotation[] = [
  // Burglary events (THEFT) - 62-96% confidence
  { videoName: "Burglary003_x264.mp4", timestamp: 33, type: "THEFT", minConfidence: 62, maxConfidence: 96 },
  { videoName: "Burglary006_x264.mp4", timestamp: 225, type: "THEFT", minConfidence: 62, maxConfidence: 96 },
  { videoName: "Burglary007_x264.mp4", timestamp: 20, type: "THEFT", minConfidence: 62, maxConfidence: 96 },
  { videoName: "Burglary009_x264.mp4", timestamp: 45, type: "THEFT", minConfidence: 62, maxConfidence: 96 },
  { videoName: "Burglary017_x264.mp4", timestamp: 46, type: "THEFT", minConfidence: 62, maxConfidence: 96 },
  { videoName: "Burglary019_x264.mp4", timestamp: 26, type: "THEFT", minConfidence: 62, maxConfidence: 96 },
  { videoName: "Burglary024_x264.mp4", timestamp: 22, type: "THEFT", minConfidence: 62, maxConfidence: 96 },

  // Fight events - 64-89% confidence
  { videoName: "Fighting005_x264.mp4", timestamp: 35, type: "FIGHT", minConfidence: 64, maxConfidence: 89 },
  { videoName: "Fighting027_x264.mp4", timestamp: 75, type: "FIGHT", minConfidence: 64, maxConfidence: 89 },
  { videoName: "Fighting037_x264.mp4", timestamp: 110, type: "FIGHT", minConfidence: 64, maxConfidence: 89 },

  // Shoplifting events (THEFT) - 72-93% confidence
  { videoName: "Shoplifting009_x264.mp4", timestamp: 65, type: "THEFT", minConfidence: 72, maxConfidence: 93 },
  { videoName: "Shoplifting020_x264.mp4", timestamp: 131, type: "THEFT", minConfidence: 72, maxConfidence: 93 },
  { videoName: "Shoplifting042_x264.mp4", timestamp: 131, type: "THEFT", minConfidence: 72, maxConfidence: 93 },

  // Vandalism events - 72-98% confidence
  { videoName: "Vandalism002_x264.mp4", timestamp: 2, type: "VANDALISM", minConfidence: 72, maxConfidence: 98 },
  { videoName: "Vandalism005_x264.mp4", timestamp: 22, type: "VANDALISM", minConfidence: 72, maxConfidence: 98 },
  { videoName: "Vandalism006_x264.mp4", timestamp: 10, type: "VANDALISM", minConfidence: 72, maxConfidence: 98 },
  { videoName: "Vandalism017_x264.mp4", timestamp: 11, type: "VANDALISM", minConfidence: 72, maxConfidence: 98 },
  { videoName: "Vandalism035_x264.mp4", timestamp: 10, type: "VANDALISM", minConfidence: 72, maxConfidence: 98 },
  { videoName: "Vandalism036_x264.mp4", timestamp: 20, type: "VANDALISM", minConfidence: 72, maxConfidence: 98 },
  { videoName: "Vandalism040_x264.mp4", timestamp: 3, type: "VANDALISM", minConfidence: 72, maxConfidence: 98 },
  { videoName: "Vandalism050_x264.mp4", timestamp: 23, type: "VANDALISM", minConfidence: 72, maxConfidence: 98 },
];

// Get event for a specific video at a specific time
export const getEventAtTime = (videoPath: string, currentTime: number): EventAnnotation | null => {
  const videoName = videoPath.split('/').pop() || '';

  // Find event for this video
  const event = eventAnnotations.find(e => e.videoName === videoName);

  if (!event) return null;

  // Check if we're within 1 second of the event timestamp (window for triggering)
  const timeDiff = Math.abs(currentTime - event.timestamp);

  if (timeDiff <= 0.5) {
    return event;
  }

  return null;
};

// Generate random confidence within range
export const getRandomConfidence = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get all events for a specific video
export const getEventsForVideo = (videoPath: string): EventAnnotation[] => {
  const videoName = videoPath.split('/').pop() || '';
  return eventAnnotations.filter(e => e.videoName === videoName);
};
