import { useEffect, useRef, useState } from 'react';

export interface DetectedPerson {
  bbox: [number, number, number, number]; // [x, y, width, height] in pixels
  score: number; // confidence 0-1
}

interface DetectionResponse {
  camera_id: number;
  detections: DetectedPerson[];
  frame_width: number;
  frame_height: number;
  timestamp: string;
}

export const usePersonDetectionPython = (
  videoRef: React.RefObject<HTMLVideoElement>,
  cameraId: number = 1,
  isEnabled: boolean = true,
  detectionInterval: number = 300, // Send frame every 300ms
  confidenceThreshold: number = 0.5,
  serverUrl: string = 'ws://localhost:8001/ws'
) => {
  const [detections, setDetections] = useState<DetectedPerson[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize canvas for frame capture
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Connect to WebSocket server
  useEffect(() => {
    if (!isEnabled) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(serverUrl);

        ws.onopen = () => {
          console.log('Connected to detection server');
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const response: DetectionResponse = JSON.parse(event.data);

            // Only update if this is for our camera
            if (response.camera_id === cameraId) {
              setDetections(response.detections);
            }
          } catch (err) {
            console.error('Error parsing detection response:', err);
          }
        };

        ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          setError('Connection error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('Disconnected from detection server');
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (isEnabled) {
              console.log('Attempting to reconnect...');
              connectWebSocket();
            }
          }, 3000);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('Error connecting to WebSocket:', err);
        setError('Failed to connect');
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isEnabled, serverUrl, cameraId]);

  // Capture and send frames periodically
  useEffect(() => {
    if (!isEnabled || !isConnected || !videoRef.current || !canvasRef.current || !wsRef.current) {
      return;
    }

    const sendFrame = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ws = wsRef.current;

      if (!video || !canvas || !ws || ws.readyState !== WebSocket.OPEN) {
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA && !video.paused) {
        try {
          // Set canvas size to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw current frame to canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to base64 JPEG
            const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

            // Send to server
            const message = {
              type: 'frame',
              data: base64Data,
              camera_id: cameraId,
              confidence: confidenceThreshold,
              timestamp: new Date().toISOString()
            };

            ws.send(JSON.stringify(message));
          }
        } catch (err) {
          console.error('Error sending frame:', err);
        }
      }
    };

    // Send frames at specified interval
    intervalRef.current = setInterval(sendFrame, detectionInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, isConnected, videoRef, cameraId, detectionInterval, confidenceThreshold]);

  return {
    detections,
    isConnected,
    error,
    isModelLoaded: isConnected // Compatible with old interface
  };
};
