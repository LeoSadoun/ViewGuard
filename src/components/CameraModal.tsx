import { X, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Detection } from "./CCTVTile";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameraId: number;
  detection: Detection | null;
}

const CameraModal = ({ isOpen, onClose, cameraId, detection }: CameraModalProps) => {
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-card border-border">
        <DialogHeader className="glass border-b border-border p-4">
          <DialogTitle className="text-foreground font-bold flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Camera {cameraId} — Live Feed
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {/* Expanded Video Feed */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden scanline film-grain mb-4">
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
              <Eye className="w-24 h-24" />
            </div>

            {/* Timestamp */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 text-xs font-mono text-foreground/80">
              {getCurrentTime()}
            </div>

            {/* Camera ID */}
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 text-xs font-semibold text-foreground/80">
              CAM {cameraId}
            </div>

            {/* Detection Overlay */}
            {detection && (
              <div
                className="absolute border-2 border-alert-high pulse-glow"
                style={{
                  left: `${detection.x}%`,
                  top: `${detection.y}%`,
                  width: `${detection.width}%`,
                  height: `${detection.height}%`,
                }}
              >
                <div className="absolute -top-8 left-0 px-3 py-1 bg-alert-high text-background text-sm font-bold">
                  {detection.type} — {detection.confidence}%
                </div>
              </div>
            )}
          </div>

          {/* Timeline Scrubber */}
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">00:00</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary"></div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">05:00</span>
            </div>

            {/* Logged Detections */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-foreground mb-2">Logged Detections</h4>
              <div className="space-y-2">
                {detection ? (
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <span className="text-foreground font-semibold">{detection.type}</span>
                    <span className="text-muted-foreground">{detection.confidence}%</span>
                    <span className="text-muted-foreground font-mono">{detection.timestamp}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No detections logged</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraModal;
