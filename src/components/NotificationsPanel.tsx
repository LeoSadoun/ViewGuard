import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Detection } from "./CCTVTile";

export interface Notification {
  id: string;
  cameraId: number;
  detection: Detection;
  timestamp: Date;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onReport: (id: string) => void;
}

const NotificationsPanel = ({ notifications, onDismiss, onReport }: NotificationsPanelProps) => {
  return (
    <div className="glass rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Notifications
        </h2>
        <div className="text-xs text-muted-foreground">
          {notifications.length} active
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="glass rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
              role="article"
              aria-label={`Alert: ${notification.detection.type} detected on Camera ${notification.cameraId}`}
            >
              {/* Thumbnail and Info */}
              <div className="flex gap-3 mb-3">
                {/* Thumbnail */}
                <div className="w-16 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0 scanline">
                  <span className="text-xs font-mono text-muted-foreground">
                    CAM {notification.cameraId}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        notification.detection.confidence >= 85
                          ? "bg-alert-high"
                          : notification.detection.confidence >= 70
                          ? "bg-alert-medium"
                          : "bg-alert-low"
                      } text-background`}
                    >
                      {notification.detection.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {notification.detection.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() => onDismiss(notification.id)}
                  aria-label="Dismiss notification"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-7 text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => onReport(notification.id)}
                  aria-label="Report false positive"
                >
                  Report
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
