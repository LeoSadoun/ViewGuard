export interface BoundingBox {
  x: number;      // X position as percentage (0-100)
  y: number;      // Y position as percentage (0-100)
  width: number;  // Width as percentage (0-100)
  height: number; // Height as percentage (0-100)
}

export interface PersonDetection {
  startTime: number;  // When person appears (in seconds)
  endTime: number;    // When person disappears (in seconds)
  type: "PERSON";
  boundingBox: BoundingBox;
}

export interface EventDetection {
  time: number;       // When event occurs (in seconds)
  type: "THEFT" | "FIGHT" | "VANDALISM" | "SHOPLIFTING";
  confidence: number; // 0-100
  boundingBox: BoundingBox;
}

export interface VideoAnnotation {
  videoFile: string;
  category: "burglary" | "fight" | "shoplifting" | "vandalism";
  duration: number;   // Video duration in seconds
  detections: PersonDetection[];  // Green boxes for people
  events: EventDetection[];       // Red/orange/yellow boxes for incidents
}
