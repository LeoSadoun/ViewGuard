import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
                         linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />

      {/* Content */}
      <div className="relative z-10 text-center space-y-12 px-4">
        {/* Title with Glow */}
        <h1 className="text-7xl md:text-9xl font-bold tracking-wider">
          <span className="text-white glow-primary">View</span>
          <span className="text-primary glow-cyber">Guard</span>
        </h1>

        {/* CTA Button */}
        <div>
          <Button asChild size="lg" className="text-lg px-16 py-7 h-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform">
            <Link to="/monitor">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Landing;