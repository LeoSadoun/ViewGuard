import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Landing = () => {
  const [typedText, setTypedText] = useState("");
  const [animationsReady, setAnimationsReady] = useState(false);
  const fullText = "ADVANCED SURVEILLANCE SYSTEM";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Delay animations to prevent initial lag
    const timer = setTimeout(() => {
      setAnimationsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move-landing 20s linear infinite',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }} />
      </div>

      {/* Animated Scan Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
          style={{
            animation: 'scan-vertical 8s ease-in-out infinite',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
            willChange: 'top',
            transform: 'translateZ(0)'
          }}
        />
        <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-50"
          style={{
            animation: 'scan-horizontal 6s ease-in-out infinite',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
            willChange: 'left',
            transform: 'translateZ(0)'
          }}
        />
      </div>

      {/* Floating Orbs */}
      {animationsReady && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute rounded-full bg-primary/20 blur-3xl animate-fade-in"
              style={{
                width: `${Math.random() * 300 + 200}px`,
                height: `${Math.random() * 300 + 200}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `fade-in 1s ease-out, float-orb ${Math.random() * 10 + 15}s ease-in-out infinite`,
                animationDelay: `0s, ${i * 2}s`,
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            />
          ))}
        </div>
      )}

      {/* Rotating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`shape-${i}`}
            className="absolute border-2 border-primary"
            style={{
              width: `${(i + 1) * 200}px`,
              height: `${(i + 1) * 200}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `rotate-shape ${20 + i * 5}s linear infinite`,
              borderRadius: i % 2 === 0 ? '0' : '50%',
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          />
        ))}
      </div>

      {/* Particle Network */}
      {animationsReady && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-primary rounded-full animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `fade-in 1s ease-out, particle-float ${Math.random() * 15 + 10}s ease-in-out infinite`,
                animationDelay: `0s, ${Math.random() * 5 + 1}s`,
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            />
          ))}
        </div>
      )}

      {/* Pulse Waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`wave-${i}`}
            className="absolute border-2 border-primary rounded-full"
            style={{
              width: '100px',
              height: '100px',
              animation: `pulse-wave ${3 + i}s ease-out infinite`,
              animationDelay: `${i * 1}s`,
              opacity: 0,
              willChange: 'width, height, opacity',
              transform: 'translateZ(0)'
            }}
          />
        ))}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-900/10 via-transparent to-blue-900/10" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-16 px-4">
        {/* Title with Glow */}
        <div className="space-y-2">
          <h1 className="text-8xl md:text-9xl font-bold tracking-tight leading-none">
            <span 
              className="inline-block text-white"
              style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)'
              }}
            >
              View
            </span>
            <span 
              className="inline-block text-primary"
              style={{
                textShadow: '0 0 20px hsl(var(--primary) / 0.8), 0 0 40px hsl(var(--primary) / 0.4)'
              }}
            >
              Guard
            </span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl tracking-widest font-light min-h-[1.75rem]">
            {typedText}
            <span className="animate-pulse">|</span>
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
