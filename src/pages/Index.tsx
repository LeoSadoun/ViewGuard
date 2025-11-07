import { useState, useEffect, useRef } from "react";
import { Activity, BarChart3, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CCTVTile, { Detection } from "@/components/CCTVTile";
import NotificationsPanel, { Notification } from "@/components/NotificationsPanel";
import ControlsPanel from "@/components/ControlsPanel";
import CameraModal from "@/components/CameraModal";

const Index = () => {
  const [detections, setDetections] = useState<Record<number, Detection | null>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [highlightedCamera, setHighlightedCamera] = useState<number | null>(null);
  const [expandedCamera, setExpandedCamera] = useState<number | null>(null);
  const [autoAcknowledge, setAutoAcknowledge] = useState(false);
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high">("medium");
  const [videoSources, setVideoSources] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate detection events
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly trigger a detection on one camera
      if (Math.random() < 0.15) {
        const cameraId = Math.floor(Math.random() * 9) + 1;
        const detectionTypes: Detection["type"][] = ["THEFT", "FIGHT", "ROBBERY", "FALL"];
        const type = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
        
        if (!type) return;

        const detection: Detection = {
          type,
          confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
          timestamp: new Date().toLocaleTimeString(),
          x: Math.random() * 60 + 10, // 10-70%
          y: Math.random() * 60 + 10,
          width: Math.random() * 20 + 15, // 15-35%
          height: Math.random() * 20 + 15,
        };

        setDetections((prev) => ({ ...prev, [cameraId]: detection }));

        // Create notification
        const notification: Notification = {
          id: `${cameraId}-${Date.now()}`,
          cameraId,
          detection,
          timestamp: new Date(),
        };
        setNotifications((prev) => [notification, ...prev]);

        // Highlight camera briefly
        setHighlightedCamera(cameraId);
        setTimeout(() => setHighlightedCamera(null), 3000);

        // Show toast
        toast.error(`Camera ${cameraId} — ${type} detected`, {
          description: `Confidence: ${detection.confidence}%`,
        });

        // Auto-clear detection after 8 seconds
        setTimeout(() => {
          setDetections((prev) => {
            const updated = { ...prev };
            delete updated[cameraId];
            return updated;
          });
        }, 8000);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Notification dismissed");
  };

  const handleReport = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("False positive reported");
  };

  const handleVideoUpload = (cameraId: number, file: File) => {
    const url = URL.createObjectURL(file);
    setVideoSources((prev) => ({ ...prev, [cameraId]: url }));
    toast.success(`Video uploaded for Camera ${cameraId}`);
  };

  const handleExport = () => {
    const data = {
      notifications: notifications.map((n) => ({
        cameraId: n.cameraId,
        type: n.detection.type,
        confidence: n.detection.confidence,
        timestamp: n.timestamp.toISOString(),
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vigilantai-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">VigilantAI</h1>
              <p className="text-xs text-muted-foreground">Live Surveillance System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <Link to="/analytics">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"></div>
              <span className="text-xs text-foreground font-semibold">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left: CCTV Grid + Controls */}
        <div className="space-y-6">
          {/* Upload Instructions */}
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  Upload Video Feeds
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Click any camera tile to upload a video file or configure RTSP stream. Supports MP4, WebM, and MOV formats.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    const cameraId = parseInt(e.target.dataset.cameraId || "1");
                    if (file) handleVideoUpload(cameraId, file);
                  }}
                />
              </div>
            </div>
          </div>

          {/* CCTV Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((cameraId) => (
              <div
                key={cameraId}
                className="relative group"
                onClick={() => {
                  if (!videoSources[cameraId]) {
                    if (fileInputRef.current) {
                      fileInputRef.current.dataset.cameraId = cameraId.toString();
                      fileInputRef.current.click();
                    }
                  } else {
                    setExpandedCamera(cameraId);
                  }
                }}
              >
                <CCTVTile
                  cameraId={cameraId}
                  detection={detections[cameraId] || null}
                  onExpand={() => setExpandedCamera(cameraId)}
                  isHighlighted={highlightedCamera === cameraId}
                  videoSource={videoSources[cameraId]}
                />
                {!videoSources[cameraId] && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-lg">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs text-foreground font-semibold">Upload Video</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <ControlsPanel
            autoAcknowledge={autoAcknowledge}
            onAutoAcknowledgeChange={setAutoAcknowledge}
            sensitivity={sensitivity}
            onSensitivityChange={setSensitivity}
            onExport={handleExport}
          />
        </div>

        {/* Right: Notifications */}
        <aside className="h-[calc(100vh-180px)] sticky top-6">
          <NotificationsPanel
            notifications={notifications}
            onDismiss={handleDismiss}
            onReport={handleReport}
          />
        </aside>
      </div>

      {/* Expanded Camera Modal */}
      {expandedCamera && (
        <CameraModal
          isOpen={!!expandedCamera}
          onClose={() => setExpandedCamera(null)}
          cameraId={expandedCamera}
          detection={detections[expandedCamera] || null}
        />
      )}
    </div>
  );
};

export default Index;
