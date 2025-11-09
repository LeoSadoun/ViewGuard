import { useEffect, useState, useRef } from "react";

interface BoundingBox {
  boxes: number[][]; // [[x1, y1, x2, y2], ...]
  confidences: number[];
  is_keyframe: boolean;
}

interface VideoInfo {
  name: string;
  width: number;
  height: number;
  fps: number;
  total_frames: number;
  frame_interval: number;
}

interface BoundingBoxData {
  video_info: VideoInfo;
  frames: Record<string, BoundingBox>;
}

interface BoundingBoxesOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoSrc: string;
  enabled?: boolean;
}

export const BoundingBoxesOverlay = ({ videoRef, videoSrc, enabled = true }: BoundingBoxesOverlayProps) => {
  const [boxData, setBoxData] = useState<BoundingBoxData | null>(null);
  const [currentBoxes, setCurrentBoxes] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load bounding box JSON for the current video
  useEffect(() => {
    if (!enabled || !videoSrc) {
      setBoxData(null);
      setCurrentBoxes([]);
      return;
    }

    const loadBoundingBoxes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Extract video name from src
        const videoName = videoSrc.split('/').pop()?.replace('.mp4', '') || '';
        const jsonUrl = `/bounding_boxes/${videoName}_boxes.json`;

        console.log(`📦 [BoundingBoxes] Loading: ${jsonUrl}`);

        const response = await fetch(jsonUrl);
        if (!response.ok) {
          throw new Error(`Failed to load bounding boxes: ${response.status}`);
        }

        const data: BoundingBoxData = await response.json();
        setBoxData(data);
        console.log(`✅ [BoundingBoxes] Loaded data for ${videoName}:`, {
          totalFrames: data.video_info.total_frames,
          fps: data.video_info.fps,
          frameInterval: data.video_info.frame_interval
        });
      } catch (err) {
        console.warn(`⚠️ [BoundingBoxes] Could not load bounding boxes:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setBoxData(null);
      } finally {
        setLoading(false);
      }
    };

    loadBoundingBoxes();
  }, [videoSrc, enabled]);

  // Update boxes based on current video time
  useEffect(() => {
    if (!enabled || !boxData || !videoRef.current) {
      return;
    }

    const video = videoRef.current;

    const updateBoxes = () => {
      const currentTime = video.currentTime;
      const fps = boxData.video_info.fps;

      // Calculate current frame number
      const currentFrame = Math.floor(currentTime * fps);

      // Get boxes for this frame
      const frameData = boxData.frames[currentFrame.toString()];

      if (frameData && frameData.boxes.length > 0) {
        setCurrentBoxes(frameData.boxes);
      } else {
        setCurrentBoxes([]);
      }
    };

    // Update on timeupdate event
    video.addEventListener('timeupdate', updateBoxes);

    // Initial update
    updateBoxes();

    return () => {
      video.removeEventListener('timeupdate', updateBoxes);
    };
  }, [boxData, videoRef, enabled]);

  // Don't render anything if disabled or no data
  if (!enabled || !boxData || currentBoxes.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      {currentBoxes.map((box, index) => {
        const videoElement = videoRef.current;
        if (!videoElement) return null;

        // Get display dimensions
        const displayWidth = videoElement.offsetWidth;
        const displayHeight = videoElement.offsetHeight;

        // Get original video dimensions
        const originalWidth = boxData.video_info.width;
        const originalHeight = boxData.video_info.height;

        // Box coordinates in original video space [x1, y1, x2, y2]
        const [x1, y1, x2, y2] = box;

        // Scale to display dimensions
        const scaleX = displayWidth / originalWidth;
        const scaleY = displayHeight / originalHeight;

        const left = x1 * scaleX;
        const top = y1 * scaleY;
        const width = (x2 - x1) * scaleX;
        const height = (y2 - y1) * scaleY;

        return (
          <div
            key={`bbox-${index}`}
            className="absolute border-2 border-green-400 bg-green-400/20"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
          >
            {/* Optional: Label */}
            <div className="absolute -top-5 left-0 px-2 py-0.5 text-[10px] font-bold bg-green-400 text-black">
              PERSON
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoundingBoxesOverlay;
