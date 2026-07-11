"use client";

import React, { useEffect, useRef, useState } from 'react';

interface VaporTextEffectProps {
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

export const VaporTextEffect = ({ onComplete }: VaporTextEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [show19, setShow19] = useState(false);
  const [opacity19, setOpacity19] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = 400;
    const height = 200;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw "18" on an offscreen canvas to sample pixels
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    offCtx.fillStyle = '#000000';
    offCtx.fillRect(0, 0, width, height);

    offCtx.font = 'bold 100px sans-serif';
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('18', width / 2, height / 2);

    // Get image data to scan pixels
    const imgData = offCtx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    // Build points array representing the text
    const textPoints: { x: number; y: number }[] = [];
    const sampleRate = 2; // sample every 2nd pixel for performance/particle density
    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const index = (y * width + x) * 4;
        // If pixel is white (part of the text)
        if (pixels[index] > 128) {
          textPoints.push({ x, y });
        }
      }
    }

    // Sort points by X coordinate so vaporization sweeps left to right
    textPoints.sort((a, b) => a.x - b.x);

    let animationFrameId: number;
    let startTime = Date.now();
    const delayBeforeVaporize = 1500; // Hold "18" for 1.5s
    const vaporizeDuration = 2000;    // Vaporization sweep takes 2s
    const particles: Particle[] = [];
    let sweepX = 0;
    let pointIndex = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;

      // Clear main canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      if (elapsed < delayBeforeVaporize) {
        // Stage 1: Display solid "18"
        ctx.font = 'bold 100px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('18', width / 2, height / 2);
      } else {
        // Stage 2: Vaporizing
        const progress = Math.min(1, (elapsed - delayBeforeVaporize) / vaporizeDuration);
        sweepX = progress * width;

        // Spawn particles for points that the sweep line has crossed
        while (pointIndex < textPoints.length && textPoints[pointIndex].x <= sweepX) {
          const pt = textPoints[pointIndex];
          
          // Spawn 1-2 particles per pixel point
          const numParticles = Math.random() > 0.5 ? 2 : 1;
          for (let p = 0; p < numParticles; p++) {
            particles.push({
              x: pt.x,
              y: pt.y,
              // Drift rightwards/outwards with random velocities
              vx: (Math.random() - 0.2) * 1.5, 
              vy: (Math.random() - 0.5) * 1.2 - 0.2, // slight upward drift
              alpha: 1.0,
              size: Math.random() > 0.6 ? 2 : 1,
            });
          }
          pointIndex++;
        }

        // Draw remaining non-vaporized part of "18"
        ctx.font = 'bold 100px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Use clipping mask to only draw text to the right of the sweep line
        ctx.save();
        ctx.beginPath();
        ctx.rect(sweepX, 0, width - sweepX, height);
        ctx.clip();
        ctx.fillText('18', width / 2, height / 2);
        ctx.restore();

        // Update and draw particles
        ctx.fillStyle = '#ffffff';
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.015; // light gravity drift downwards
          p.alpha -= 0.015; // fade out

          if (p.alpha <= 0) {
            particles.splice(i, 1);
          } else {
            ctx.globalAlpha = p.alpha;
            ctx.fillRect(p.x, p.y, p.size, p.size);
          }
        }
        ctx.globalAlpha = 1.0; // Reset alpha
      }

      // Check if vaporization and dissipation are fully complete
      if (elapsed > delayBeforeVaporize + vaporizeDuration + 1200) {
        // Trigger Stage 3: Fade in "19"
        setShow19(true);
        cancelAnimationFrame(animationFrameId);
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle "19" fade-in
  useEffect(() => {
    if (show19) {
      let startTime = Date.now();
      const duration = 1500; // 1.5s fade-in

      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        setOpacity19(progress);

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          // Finished entire sequence! Wait 1.5s and trigger parent completion
          setTimeout(() => {
            onComplete();
          }, 1500);
        }
      };
      fade();
    }
  }, [show19, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-black z-50 flex flex-col items-center justify-center select-none"
    >
      <div className="relative w-[400px] h-[200px] flex items-center justify-center">
        {!show19 ? (
          <canvas ref={canvasRef} className="w-full h-full" />
        ) : (
          <div 
            style={{ opacity: opacity19 }}
            className="text-[100px] font-bold text-white tracking-wide transition-opacity duration-300 font-sans"
          >
            19
          </div>
        )}
      </div>
    </div>
  );
};
