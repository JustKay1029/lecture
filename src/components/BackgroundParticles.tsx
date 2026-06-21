import React, { useEffect, useRef } from 'react';

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      angle: number;
      spin: number;
      opacity: number;
      type: 'petal' | 'heart';
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (isInit = false) => {
      return {
        x: Math.random() * canvas.width,
        y: isInit ? Math.random() * canvas.height : -20,
        size: Math.random() * 8 + 3,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: Math.random() * 0.8 - 0.4,
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.02 - 0.01,
        opacity: Math.random() * 0.35 + 0.15,
        type: Math.random() > 0.4 ? ('petal' as const) : ('heart' as const),
      };
    };

    const init = () => {
      resize();
      particles = Array.from({ length: 40 }, () => createParticle(true));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y / 60) * 0.2;
        p.angle += p.spin;

        if (p.y > canvas.height + 20) {
          particles[idx] = createParticle(false);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.type === 'heart') {
          ctx.fillStyle = '#ffabf3'; // Lush Magenta / Rose
          ctx.font = `${p.size * 2.2}px serif`;
          ctx.fillText('❤', p.x, p.y);
        } else {
          // Drawing high quality cherry rose petal paths
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          ctx.fillStyle = '#ffb3b5'; // Pale Pink
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(p.size, -p.size, p.size * 1.5, p.size, 0, p.size);
          ctx.bezierCurveTo(-p.size * 1.5, p.size, -p.size, -p.size, 0, 0);
          ctx.fill();
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />;
}
