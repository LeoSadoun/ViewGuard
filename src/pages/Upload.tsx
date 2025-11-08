import { Shield, BarChart3, FileText, Upload as UploadIcon, Video, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      toast.error("Please upload video files only");
      return;
    }

    toast.success(`${videoFiles.length} video(s) uploaded successfully`);
    console.log("Uploaded files:", videoFiles);
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
              <UploadIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-wider">View<span className="text-primary">Guard</span></h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Upload</p>
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
              <Link to="/realtime">
                <Radio className="w-4 h-4" />
                Realtime
              </Link>
            </Button>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Video Timestamp Analyzer Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Video Timestamp Analyzer</h2>
          <p className="text-muted-foreground">Upload surveillance footage for AI-powered analysis</p>
        </div>

        {/* Upload Box */}
        <div
          className={`relative border-2 border-dashed rounded-lg transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="video-upload"
            className="hidden"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
          />
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center py-20 px-6 cursor-pointer"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                <Video className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-2">Click to Upload</h3>
            <p className="text-sm text-muted-foreground mb-4">or drag and drop your video files here</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="px-3 py-1 rounded-full bg-muted/50 border border-border">MP4</div>
              <div className="px-3 py-1 rounded-full bg-muted/50 border border-border">AVI</div>
              <div className="px-3 py-1 rounded-full bg-muted/50 border border-border">MOV</div>
              <div className="px-3 py-1 rounded-full bg-muted/50 border border-border">MKV</div>
            </div>
          </label>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h4 className="text-sm font-semibold text-foreground">Automated Detection</h4>
            </div>
            <p className="text-xs text-muted-foreground">AI analyzes footage for suspicious activity</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h4 className="text-sm font-semibold text-foreground">Timestamp Extraction</h4>
            </div>
            <p className="text-xs text-muted-foreground">Precise event timing and markers</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h4 className="text-sm font-semibold text-foreground">Detailed Reports</h4>
            </div>
            <p className="text-xs text-muted-foreground">Generate comprehensive incident reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
