import { useState } from "react";
import { Shield, BarChart3, FileText, Clock, AlertTriangle, Play, Upload, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useReports, Report } from "@/contexts/ReportsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Reports = () => {
  const { reports } = useReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const getDetectionColor = (type: string) => {
    const colors: Record<string, string> = {
      THEFT: "destructive",
      FIGHT: "destructive",
      ROBBERY: "destructive",
      FALL: "default",
      VANDALISM: "secondary",
    };
    return colors[type] || "default";
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 cyber-bg">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animation: "float-particle 15s linear infinite",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="mb-6 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded bg-primary/20 border border-primary flex items-center justify-center glow-cyber">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-wider">View<span className="text-primary">Guard</span></h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Reports</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/monitor">
                <Shield className="w-4 h-4" />
                Monitor
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/upload">
                <Upload className="w-4 h-4" />
                Upload
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/realtime">
                <Radio className="w-4 h-4" />
                Realtime
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/analytics">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Reports Table */}
      <div className="relative z-10">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">All Reports</h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                {reports.length} Total
              </Badge>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No reports yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reports will appear here when you mark detections as false positives
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-foreground">Camera</TableHead>
                  <TableHead className="text-foreground">Detection Type</TableHead>
                  <TableHead className="text-foreground">Confidence</TableHead>
                  <TableHead className="text-foreground">Timestamp</TableHead>
                  <TableHead className="text-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors border-border"
                    onClick={() => setSelectedReport(report)}
                  >
                    <TableCell className="font-medium text-foreground">
                      Camera {report.cameraId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getDetectionColor(report.detection.type) as any}>
                        {report.detection.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {report.detection.confidence}%
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(report.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                      >
                        <Play className="w-3 h-3" />
                        View Footage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Video Footage Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Incident Footage Review</DialogTitle>
            <DialogDescription>
              Camera {selectedReport?.cameraId} — {selectedReport?.detection.type} Detection
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              
              {/* Simulated Video Feed with detection box */}
              <div className="relative w-full h-full bg-black/80 flex items-center justify-center">
                <div className="absolute inset-0 opacity-40">
                  <div className="grid grid-cols-8 grid-rows-6 w-full h-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-primary/10" />
                    ))}
                  </div>
                </div>
                
                {selectedReport?.detection && (
                  <div
                    className="absolute border-2 border-destructive animate-pulse"
                    style={{
                      left: `${selectedReport.detection.x}%`,
                      top: `${selectedReport.detection.y}%`,
                      width: `${selectedReport.detection.width}%`,
                      height: `${selectedReport.detection.height}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded">
                      {selectedReport.detection.type}
                    </div>
                  </div>
                )}
                
                <div className="text-center space-y-2">
                  <Play className="w-16 h-16 text-primary/50 mx-auto" />
                  <p className="text-muted-foreground text-sm">Recording from incident</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(selectedReport?.timestamp || new Date())}
                  </p>
                </div>
              </div>
              
              {/* Video timestamp overlay */}
              <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded text-xs font-mono text-primary border border-primary/30">
                {selectedReport?.detection.timestamp}
              </div>
            </div>

            {/* Report Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-card/50 rounded-lg border border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Detection Type</p>
                <Badge variant={getDetectionColor(selectedReport?.detection.type || "") as any}>
                  {selectedReport?.detection.type}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Confidence Level</p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedReport?.detection.confidence}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Camera Location</p>
                <p className="text-sm font-semibold text-foreground">
                  Camera {selectedReport?.cameraId}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Report Time</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatTimestamp(selectedReport?.timestamp || new Date())}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
