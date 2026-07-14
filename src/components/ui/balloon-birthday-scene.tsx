"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface BalloonBirthdaySceneProps {
  onComplete: () => void;
}

export const BalloonBirthdayScene = ({ onComplete }: BalloonBirthdaySceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Load Fleur De Leah & DynaPuff (bubble font) from Google Fonts dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=DynaPuff:wght@700&family=Fleur+De+Leah&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Gyroscope handlers & permission request for iOS
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
        setHasPermission(false); // iOS requires user gesture trigger
      } else {
        setHasPermission(true);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    checkOrientation();
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const handleOrientation = (e: DeviceOrientationEvent) => {
    const beta = e.beta || 0;
    const gamma = e.gamma || 0;

    const deadzone = 2;
    let targetX = 0;
    let targetY = 0;

    if (Math.abs(beta) > deadzone) {
      // Map forward/back tilt (beta 30 to 70 is normal phone viewing angle)
      targetX = Math.max(-25, Math.min(25, (beta - 45) * 0.7));
    }
    if (Math.abs(gamma) > deadzone) {
      targetY = Math.max(-30, Math.min(30, gamma * 0.7));
    }

    targetRotation.current = { x: targetX, y: targetY };
  };

  const requestPermission = async () => {
    const request = (DeviceOrientationEvent as any).requestPermission;
    if (typeof request === 'function') {
      try {
        const response = await request();
        if (response === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        setHasPermission(false);
      }
    }
  };

  // Mouse / Touch Drag fallback
  const handleStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    dragStart.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;

    targetRotation.current = {
      x: Math.max(-35, Math.min(35, targetRotation.current.x - dy * 0.45)),
      y: Math.max(-40, Math.min(40, targetRotation.current.y + dx * 0.45))
    };
    dragStart.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  // Animation rendering loop with lerp smoothing (0.1 damping coefficient)
  useEffect(() => {
    let animId: number;

    const tick = () => {
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;

      setRotation({
        x: currentRotation.current.x,
        y: currentRotation.current.y
      });

      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-50 flex flex-col justify-between items-center py-10 select-none overflow-hidden"
      style={{
        background: 'var(--bg-color, #6EC1E4)',
        perspective: '1000px',
        touchAction: 'none'
      }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Exposing Configurable CSS Custom Properties for ease of customization later */}
      <style>{`
        :root {
          --bg-color: #6ec1e4;
          --bubble-primary: #4ecdc4;
          --bubble-highlight: #ff6b9d;
          --bubble-rim: #a8e6cf;
          --bubble-glow: #e0fdf5;
          --text-19th: #ffd700;
          --flourish-color: #ff6b9d;
        }

        /* 3D Glossy Bubble Text rendering */
        .bubble-text {
          font-family: 'DynaPuff', cursive, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          fill: url(#bubble-gradient);
          filter: drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.15));
        }

        /* Glossy Highlight stroke overlay mimicking plastic/liquid reflection */
        .glossy-specular-light {
          fill: none;
          stroke: #ffffff;
          stroke-width: 4px;
          stroke-linecap: round;
          opacity: 0.85;
          filter: blur(0.5px);
        }

        /* Iridescent soapy bubble gradient texture */
        .soapy-bubble {
          background: radial-gradient(
            circle at 35% 35%,
            var(--bubble-glow) 0%,
            rgba(255, 255, 255, 0.45) 20%,
            rgba(78, 205, 196, 0.5) 50%,
            rgba(255, 107, 157, 0.55) 80%,
            rgba(168, 230, 207, 0.6) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.65);
          box-shadow: 
            inset -8px -8px 20px rgba(0, 0, 0, 0.12),
            inset 8px 8px 20px rgba(255, 255, 255, 0.7),
            0 12px 24px rgba(0, 0, 0, 0.12);
        }
      `}</style>

      {/* Dynamic SVG Gradient definitions for clean vector bubbles */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          {/* Main bubbly text gradient fill */}
          <linearGradient id="bubble-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bubble-rim)" />
            <stop offset="35%" stopColor="var(--bubble-primary)" />
            <stop offset="75%" stopColor="#a072ff" />
            <stop offset="100%" stopColor="var(--bubble-highlight)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header permission handler button */}
      <div className="z-50 h-8 flex items-center">
        {hasPermission === false && (
          <button 
            onClick={requestPermission}
            className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-white/20 border border-white/30 text-white cursor-pointer active:scale-95 transition-all"
          >
            Enable Motion Controls 📱
          </button>
        )}
      </div>

      {/* Main 3D Interactive Composition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
        className="w-full flex-1 flex flex-col items-center justify-center relative select-none cursor-grab active:cursor-grabbing animate-[float-idle_4.5s_ease-in-out_infinite]"
      >
        
        {/* Floating Bubble Spheres Behind (Z-depth) */}
        <div 
          style={{ transform: 'translateZ(-160px) translateY(-80px) translateX(-110px)' }}
          className="absolute w-24 h-24 rounded-full soapy-bubble animate-[bob-independent_5s_ease-in-out_infinite]"
        />
        <div 
          style={{ transform: 'translateZ(-90px) translateY(120px) translateX(120px)' }}
          className="absolute w-20 h-20 rounded-full soapy-bubble animate-[bob-independent-staggered_3.8s_ease-in-out_infinite]"
        />

        {/* LINE 1: HAPPY (Styled SVG bubble text with specular highlight layer) */}
        <div 
          style={{ transform: 'translateZ(50px)' }}
          className="w-full max-w-[280px] sm:max-w-[340px] drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
        >
          <svg viewBox="0 0 320 80" className="w-full h-auto overflow-visible select-none">
            {/* 3D Extrusion layer */}
            <text x="160" y="60" textAnchor="middle" className="bubble-text text-6xl" fill="rgba(0,0,0,0.15)" transform="translate(0, 4)" style={{ fontFamily: 'DynaPuff' }}>HAPPY</text>
            {/* Main bubble text */}
            <text x="160" y="60" textAnchor="middle" className="bubble-text text-6xl" style={{ fontFamily: 'DynaPuff' }}>HAPPY</text>
            {/* White glossy specular highlight curves overlaying top-left curves */}
            <path d="M 62 38 Q 66 32 72 32 M 112 38 Q 116 32 122 32 M 162 38 Q 166 32 172 32 M 212 38 Q 216 32 222 32 M 262 38 Q 266 32 272 32" className="glossy-specular-light" />
          </svg>
        </div>

        {/* CENTER ELEMENT: 19th script */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          style={{ transform: 'translateZ(110px)' }}
          className="relative my-2 flex items-center justify-center select-none"
        >
          {/* Swirling vine flourishes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <svg width="220" height="120" viewBox="0 0 220 120" fill="none" className="opacity-90">
              <path d="M40 60 C80 30, 100 20, 110 50 C115 65, 95 85, 110 95 C125 105, 140 70, 180 60" stroke="var(--flourish-color)" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M60 40 C75 15, 105 10, 110 40 C115 70, 130 80, 160 80" stroke="var(--flourish-color)" strokeWidth="2.5" strokeDasharray="4,4" strokeLinecap="round" />
            </svg>
          </div>

          {/* Fleur De Leah large 19th display */}
          <div className="relative z-10 text-[var(--text-19th)] text-7.5xl sm:text-8.5xl select-none font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex items-baseline leading-none">
            <span style={{ fontFamily: "'Fleur De Leah', cursive", fontWeight: 'bold' }}>19</span>
            <span className="text-xl sm:text-2xl font-serif text-white align-super font-semibold ml-0.5">th</span>
          </div>
        </motion.div>

        {/* LINE 2: BIRTHDAY (Styled SVG bubble text with specular highlight layer) */}
        <div 
          style={{ transform: 'translateZ(30px)' }}
          className="w-full max-w-[320px] sm:max-w-[400px] drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
        >
          <svg viewBox="0 0 400 80" className="w-full h-auto overflow-visible select-none">
            {/* Extrusion */}
            <text x="200" y="60" textAnchor="middle" className="bubble-text text-6xl" fill="rgba(0,0,0,0.15)" transform="translate(0, 4)" style={{ fontFamily: 'DynaPuff' }}>BIRTHDAY</text>
            {/* Main text */}
            <text x="200" y="60" textAnchor="middle" className="bubble-text text-6xl" style={{ fontFamily: 'DynaPuff' }}>BIRTHDAY</text>
            {/* Glossy specular reflection path curves */}
            <path d="M 42 38 Q 46 32 52 32 M 90 38 Q 94 32 100 32 M 142 38 Q 146 32 152 32 M 190 38 Q 194 32 200 32 M 238 38 Q 242 32 248 32 M 288 38 Q 292 32 298 32 M 342 38 Q 346 32 352 32" className="glossy-specular-light" />
          </svg>
        </div>

        {/* Floating Bubble Spheres In Front (Z-depth) */}
        <div 
          style={{ transform: 'translateZ(130px) translateY(-120px) translateX(90px)' }}
          className="absolute w-20 h-20 rounded-full soapy-bubble animate-[bob-independent-staggered_4.2s_ease-in-out_infinite]"
        />
        <div 
          style={{ transform: 'translateZ(170px) translateY(80px) translateX(-120px)' }}
          className="absolute w-14 h-14 rounded-full soapy-bubble animate-[bob-independent_6s_ease-in-out_infinite]"
        />
        <div 
          style={{ transform: 'translateZ(70px) translateY(100px) translateX(-20px)' }}
          className="absolute w-12 h-12 rounded-full soapy-bubble animate-[bob-independent_4.8s_ease-in-out_infinite]"
        />
        
      </motion.div>

      {/* Navigation button to enter the main letters */}
      <div className="z-50 px-6 w-full max-w-xs mb-4">
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-full bg-white text-[#6EC1E4] hover:bg-white/95 font-semibold text-sm uppercase tracking-wider shadow-2xl active:scale-95 transition-all cursor-pointer text-center"
        >
          Step Inside ➔
        </button>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes float-idle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes bob-independent {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(4deg); }
        }

        @keyframes bob-independent-staggered {
          0%, 100% { transform: translateY(-12px) rotate(-3deg); }
          50% { transform: translateY(12px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
};
export default BalloonBirthdayScene;
