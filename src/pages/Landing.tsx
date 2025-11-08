import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Landing = () => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Layered gradient backgrounds with blue merging into black */}
      <div className="absolute inset-0">
        {/* Base gradient from corners */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-black" />
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-800/20 via-transparent to-transparent" />
        
        {/* Animated radial gradients */}
        <div 
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(29, 78, 216, 0.5) 0%, transparent 70%)',
            animation: 'pulse 10s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
        
        {/* Center glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-16 px-4">
        {/* Title with Glow */}
        <div className="space-y-2">
          <h1 className="text-8xl md:text-9xl font-bold tracking-tight leading-none">
            <span className="inline-block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">View</span>
            <span className="inline-block text-primary drop-shadow-[0_0_50px_hsl(var(--primary))]">Guard</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl tracking-widest font-light">
            ADVANCED SURVEILLANCE SYSTEM
          </p>
        </div>

        {/* CTA Button */}
        <div>
          <Button 
            asChild 
            size="lg" 
            className="group relative text-lg px-14 py-7 h-auto rounded-full bg-gradient-to-r from-blue-500 to-blue-900 text-white hover:from-blue-600 hover:to-blue-950 transition-all duration-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:shadow-[0_0_60px_rgba(59,130,246,0.9)] hover:scale-110 font-bold tracking-wide"
          >
            <Link to="/monitor" className="flex items-center gap-3">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-white/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Landing;