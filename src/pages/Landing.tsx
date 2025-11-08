import { Button } from "@/components/ui/button";
import { Shield, Eye, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" 
           style={{
             backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
             backgroundSize: '50px 50px',
             animation: 'grid-move 20s linear infinite'
           }} />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animation: "float-particle 15s linear infinite"
            }}
          />
        ))}
      </div>

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background" />

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanline pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl mx-auto">
        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center glow-cyber">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-alert-high/20 border border-alert-high flex items-center justify-center animate-pulse-glow">
              <Eye className="w-4 h-4 text-alert-high" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-wider">
            <span className="text-foreground">ViewGuard</span>
            <span className="text-primary">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground uppercase tracking-[0.3em] font-light">
            Neural Surveillance Grid
          </p>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Advanced AI-powered surveillance system with real-time threat detection. 
          Monitor, analyze, and respond to security events instantly.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>Real-time Detection</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>AI-Powered Analysis</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4 text-primary" />
            <span>24/7 Monitoring</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Button
            asChild
            size="lg"
            className="text-lg px-12 py-6 h-auto bg-primary text-primary-foreground hover:bg-primary/90 glow-cyber animate-pulse-glow"
          >
            <Link to="/monitor">
              Get Started
            </Link>
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 pt-8">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            System Online
          </span>
        </div>
      </div>

      {/* Film Grain */}
      <div className="film-grain pointer-events-none" />
    </div>
  );
};

export default Landing;
