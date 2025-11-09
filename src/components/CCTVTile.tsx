import { useState, useRef, useEffect } from "react";
import { Eye } from "lucide-react";
import { usePersonDetection } from "@/hooks/usePersonDetection";
import { useEventDetection } from "@/hooks/useEventDetection";
import { getCurrentVideo, getNextVideo } from "@/config/videoScheduler";
import { BoundingBoxesOverlay } from "@/components/BoundingBoxesOverlay";

export type DetectionType = "THEFT" | "FIGHT" | "ROBBERY" | "FALL" | "VANDALISM" | null;

export interface Detection {
  type: DetectionType;
  confidence: number;
  timestamp: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CCTVTileProps {
  cameraId: number;
  detection: Detection | null;
  onExpand: () => void;
  isHighlighted?: boolean;
  videoSources?: string[];
  onEventDetected?: (cameraId: number, detection: Detection, videoUrl: string, videoTimestamp: number) => void;
}

const CCTVTile = ({ cameraId, detection, onExpand, isHighlighted, videoSources, onEventDetected }: CCTVTileProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(() => getCurrentVideo(cameraId));
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video end - get next unique video from scheduler
  const handleVideoEnd = () => {
    const nextVideo = getNextVideo(cameraId);
    setCurrentVideo(nextVideo);
  };

  // Initialize video on mount
  useEffect(() => {
    setCurrentVideo(getCurrentVideo(cameraId));
  }, [cameraId]);

  // TensorFlow.js disabled - using pre-processed JSON bounding boxes instead
  const { detections: personDetections } = usePersonDetection(videoRef, false, 200, 0.2);

  // Use event detection (AI-powered event detection at specific timestamps)
  const { detection: eventDetection, shouldTrigger, videoTimestamp } = useEventDetection({
    videoRef,
    videoSrc: currentVideo,
    enabled: true, // Re-enabled - this is the critical feature
  });

  // Merge event detection with external detection prop
  const activeDetection = eventDetection || detection;

  // Track if we've already notified for this event
  const lastNotifiedEvent = useRef<string | null>(null);

  // Trigger notification when event is detected (only once per event)
  useEffect(() => {
    if (shouldTrigger && eventDetection && onEventDetected) {
      const eventKey = `${cameraId}-${eventDetection.timestamp}`;
      if (lastNotifiedEvent.current !== eventKey) {
        lastNotifiedEvent.current = eventKey;
        onEventDetected(cameraId, eventDetection, currentVideo, videoTimestamp);
      }
    }
  }, [shouldTrigger, eventDetection, cameraId, onEventDetected, currentVideo, videoTimestamp]);

  // Debug logging for detections (disabled to improve performance)
  // useEffect(() => {
  //   console.log(`🎥 [CCTVTile CAM ${cameraId}] Person detections:`, personDetections.length);
  //   if (personDetections.length > 0) {
  //     console.log(`📦 [CCTVTile CAM ${cameraId}] Bounding boxes:`, personDetections.map(p => p.bbox));
  //   }
  // }, [personDetections, cameraId]);

  const getRiskLevel = (confidence: number) => {
    if (confidence >= 85) return "high";
    if (confidence >= 70) return "medium";
    return "low";
  };

  const getGlowClass = (confidence: number) => {
    const risk = getRiskLevel(confidence);
    if (risk === "high") return "glow-high";
    if (risk === "medium") return "glow-medium";
    return "glow-low";
  };

  const getBorderClass = () => {
    if (isHighlighted) return "border-primary border-2 animate-pulse-glow";
    if (activeDetection) {
      const risk = getRiskLevel(activeDetection.confidence);
      if (risk === "high") return "border-alert-high";
      if (risk === "medium") return "border-alert-medium";
      return "border-alert-low";
    }
    return "border-border";
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`relative bg-card border-2 ${getBorderClass()} rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        isHovered ? "scale-105 z-10" : ""
      }`}
      style={{ aspectRatio: '16/10' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onExpand}
      role="button"
      tabIndex={0}
      aria-label={`Camera ${cameraId}${activeDetection ? ` - ${activeDetection.type} detected` : ""}`}
      onKeyDown={(e) => e.key === "Enter" && onExpand()}
    >
      {/* CCTV Feed Background */}
      <div className="absolute inset-0 bg-muted scanline film-grain">
        <video
          ref={videoRef}
          src={currentVideo}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Camera ID - Top Left */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-[10px] font-semibold text-foreground/80 z-20">
        CAM {cameraId}
      </div>

      {/* Timestamp - Bottom Right */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-[10px] font-mono text-foreground/80 z-20">
        {getCurrentTime()}
      </div>

      {/* Person Detection Overlays (Green Boxes) - Pre-processed from Python/YOLOv8 */}
      <BoundingBoxesOverlay
        videoRef={videoRef}
        videoSrc={currentVideo}
        enabled={true}
      />

      {/* Event Detection Overlay (Red/Orange/Yellow Boxes) */}
      {activeDetection && (
        <div
          className={`absolute detection-enter ${getGlowClass(activeDetection.confidence)} pulse-glow z-30`}
          style={{
            left: `${activeDetection.x}%`,
            top: `${activeDetection.y}%`,
            width: `${activeDetection.width}%`,
            height: `${activeDetection.height}%`,
          }}
        >
          {/* Bounding Box */}
          <div
            className={`w-full h-full border-2 ${
              getRiskLevel(activeDetection.confidence) === "high"
                ? "border-alert-high"
                : getRiskLevel(activeDetection.confidence) === "medium"
                ? "border-alert-medium"
                : "border-alert-low"
            }`}
          >
            {/* Label */}
            <div
              className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold ${
                getRiskLevel(activeDetection.confidence) === "high"
                  ? "bg-alert-high"
                  : getRiskLevel(activeDetection.confidence) === "medium"
                  ? "bg-alert-medium"
                  : "bg-alert-low"
              } text-background`}
            >
              {activeDetection.type} — {activeDetection.confidence}%
            </div>
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center z-40">
          <div className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-semibold">
            Click to expand
          </div>
        </div>
      )}
    </div>
  );
};

export default CCTVTile;
