import { useState, useEffect } from "react";
import { Shield, BarChart3, Video, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CCTVTile, { Detection } from "@/components/CCTVTile";
import NotificationsPanel, { Notification } from "@/components/NotificationsPanel";
import CameraModal from "@/components/CameraModal";
import { useReports } from "@/contexts/ReportsContext";
const Index = () => {
  const {
    addReport
  } = useReports();
  const [detections, setDetections] = useState<Record<number, Detection | null>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [highlightedCamera, setHighlightedCamera] = useState<number | null>(null);
  const [expandedCamera, setExpandedCamera] = useState<number | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState<"loading" | "success">("loading");
  const [currentReportType, setCurrentReportType] = useState<string>("");
  const onlineCameras = 8; // Simulated online count

  // Simulate detection events
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly trigger a detection on one camera
      if (Math.random() < 0.15) {
        const cameraId = Math.floor(Math.random() * 9) + 1;
        const detectionTypes: Detection["type"][] = ["THEFT", "FIGHT", "ROBBERY", "FALL", "VANDALISM"];
        const type = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
        if (!type) return;
        const detection: Detection = {
          type,
          confidence: Math.floor(Math.random() * 30) + 70,
          // 70-100%
          timestamp: new Date().toLocaleTimeString(),
          x: Math.random() * 60 + 10,
          // 10-70%
          y: Math.random() * 60 + 10,
          width: Math.random() * 20 + 15,
          // 15-35%
          height: Math.random() * 20 + 15
        };
        setDetections(prev => ({
          ...prev,
          [cameraId]: detection
        }));

        // Create notification
        const notification: Notification = {
          id: `${cameraId}-${Date.now()}`,
          cameraId,
          detection,
          timestamp: new Date()
        };
        setNotifications(prev => [notification, ...prev]);

        // Highlight camera briefly
        setHighlightedCamera(cameraId);
        setTimeout(() => setHighlightedCamera(null), 3000);

        // Show toast
        toast.error(`Camera ${cameraId} — ${type} detected`, {
          description: `Confidence: ${detection.confidence}%`
        });

        // Auto-clear detection after 8 seconds
        setTimeout(() => {
          setDetections(prev => {
            const updated = {
              ...prev
            };
            delete updated[cameraId];
            return updated;
          });
        }, 8000);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);
  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.info("Notification dismissed");
  };
  const handleReport = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setCurrentReportType(notification.detection.type);
      setReportStatus("loading");
      setReportDialogOpen(true);
      
      setTimeout(() => {
        addReport({
          id: notification.id,
          cameraId: notification.cameraId,
          detection: notification.detection,
          timestamp: notification.timestamp
        });
        setNotifications(prev => prev.filter(n => n.id !== id));
        setReportStatus("success");
        
        setTimeout(() => {
          setReportDialogOpen(false);
          toast.success(`${notification.detection.type} reported`);
        }, 2000);
      }, 3000);
    }
  };
  return <div className="min-h-screen bg-background p-4 md:p-6 cyber-bg">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({
        length: 20
      }).map((_, i) => <div key={i} className="absolute w-1 h-1 bg-primary rounded-full" style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animation: "float-particle 15s linear infinite"
      }} />)}
      </div>

      {/* Header */}
      <header className="mb-6 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/20 border border-primary flex items-center justify-center glow-cyber">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-wider">ViewGuard<span className="text-primary">AI</span></h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Neural Surveillance Grid</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/reports">
                <FileText className="w-4 h-4" />
                Reports
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 relative z-10">
        {/* Left: CCTV Grid */}
        <div>
          {/* CCTV Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({
            length: 9
          }, (_, i) => i + 1).map(cameraId => <CCTVTile key={cameraId} cameraId={cameraId} detection={detections[cameraId] || null} onExpand={() => setExpandedCamera(cameraId)} isHighlighted={highlightedCamera === cameraId} />)}
          </div>
        </div>

        {/* Right: Camera Status + Notifications */}
        <aside className="h-[calc(100vh-180px)] sticky top-6 space-y-4">
          {/* Camera Status */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Cameras</p>
                <p className="text-sm font-bold text-foreground">
                  {onlineCameras}/9 online
                </p>
              </div>
            </div>
          </div>
          {/* Notifications */}
          <NotificationsPanel notifications={notifications} onDismiss={handleDismiss} onReport={handleReport} />
        </aside>
      </div>

      {expandedCamera && <CameraModal isOpen={!!expandedCamera} onClose={() => setExpandedCamera(null)} cameraId={expandedCamera} detection={detections[expandedCamera] || null} />}
      
      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            {reportStatus === "loading" ? (
              <>
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Processing Report</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Analyzing {currentReportType} detection...
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Report Submitted</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {currentReportType} detection has been reported
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;