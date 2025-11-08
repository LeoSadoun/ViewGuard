import { Shield, BarChart3, FileText, Radio, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Realtime = () => {
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
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-wider">View<span className="text-primary">Guard</span></h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Realtime</p>
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
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-6">
            <Radio className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Realtime AI Integration</h2>
          <p className="text-muted-foreground mb-6">
            Connect with AI-powered real-time analysis and communication
          </p>
          <Button variant="outline" className="gap-2">
            <Radio className="w-4 h-4" />
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Realtime;
