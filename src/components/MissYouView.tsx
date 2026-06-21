import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart } from 'lucide-react';
import { StarThought } from '../types';

interface MissYouViewProps {
  onBack: () => void;
}

const MESSAGES = [
  "No matter how many miles separate us, you are the first thing I think of when I wake up and the last thing I dream of. ❤️",
  "I wish I could wrap my arms around you right now and whisper how much I love you. Hold on, my love, we will be together soon. 🫂",
  "Every second away from you only makes me realize how precious our time together is. You are my home. 🏠✨",
  "Close your eyes and take a deep breath. Can you feel it? That is me sending you a warm hug across the distance. 🌸",
  "You are my favorite thought, my sweetest dream, and the best part of my day. I miss you so much, Isha. 🌹",
  "We are under the same sky, looking at the same moon. The distance is temporary, but my love for you is forever. 🌙",
  "My love for you increases with every beat of my heart. I cannot wait to hold you tight and tell you in person. 💖",
  "Isha, you are my true sanctuary, my peace, and my greatest blessing. Sending you endless love and comfort across the miles. 👑✨"
];

export default function MissYouView({ onBack }: MissYouViewProps) {
  const [internalStars, setInternalStars] = useState<StarThought[]>([]);
  const [releasedStars, setReleasedStars] = useState<Array<StarThought & { scale: number; ex: number; ey1: number; ey2: number }>>([]);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  // Synthesize soft wind chimes on star release / interaction
  const playChimeSound = (frequency: number) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      // Ignored if browser restricts Web Audio on interactions
    }
  };

  useEffect(() => {
    // Generate initial floating stars inside the jar
    const stars = Array.from({ length: 6 }, (_, idx) => ({
      id: `star-${idx}`,
      left: 15 + Math.random() * 70,
      bottom: 12 + Math.random() * 58,
      driftX: Math.random() * 26 - 13,
      driftY: -(Math.random() * 24 + 10),
      delay: Math.random() * 3,
    }));
    setInternalStars(stars);
  }, []);

  const handleJarClick = () => {
    // Play sweet chime sound (pitch variations for natural feel)
    const pitches = [523.25, 587.33, 659.25, 698.46, 783.99]; // C5, D5, E5, F5, G5
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];
    playChimeSound(pitch);

    // Release a flying star
    const nextMsg = MESSAGES[messageIndex];
    setMessageIndex((prev) => (prev + 1) % MESSAGES.length);

    const newStar = {
      id: `released-${Date.now()}`,
      left: 50,
      bottom: 85,
      driftX: 0,
      driftY: 0,
      delay: 0,
      scale: 1,
      ex: Math.random() * 240 - 120, // drift left/right up to 120px
      ey1: -(Math.random() * 120 + 80), // initial stage rise
      ey2: -(Math.random() * 450 + 350), // ending drift distance
    };

    setReleasedStars((prev) => [...prev, newStar]);

    // Automatically trigger showing the letter matching this release
    setActiveMessage(nextMsg);

    // Cleanup flying star after animation completes
    setTimeout(() => {
      setReleasedStars((prev) => prev.filter((s) => s.id !== newStar.id));
    }, 8000);
  };

  const handleStarClick = (e: React.MouseEvent, customMsg?: string) => {
    e.stopPropagation();
    playChimeSound(659.25); // high crisp note for notification note
    const selectedMsg = customMsg || MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setActiveMessage(selectedMsg);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-6 relative overflow-hidden select-none">
      {/* Back Ribbon Tab identical to original mockup */}
      <button
        onClick={onBack}
        className="fixed top-0 left-4 sm:left-8 z-50 bg-[#800020] text-[#ffdada] px-4 py-2 hover:py-2.5 rounded-b-xl shadow-xl flex flex-row items-center gap-2 transition-all cursor-pointer border-x border-b border-[#ffb3b5]/30 group active:scale-95"
      >
        <span className="text-xs group-hover:-translate-x-0.5 transition-transform">◀</span>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase">
          Garden
        </span>
      </button>

      {/* Main Header */}
      <header className="w-full text-center mt-12 mb-8 z-10 transition-all duration-500">
        <h1 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-3 drop-shadow-[0_2px_12px_rgba(128,0,32,0.6)]">
          I Miss You
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#e0bfbf] max-w-xs mx-auto leading-relaxed opacity-95">
          Tap the jar to release a star of my thoughts for you, or tap any star to read it.
        </p>
      </header>

      {/* Glass Jar Interactive Area */}
      <main className="flex-1 w-full max-w-lg flex items-center justify-center relative z-20">
        <div 
          onClick={handleJarClick}
          className="relative w-64 h-80 cursor-pointer group active:scale-95 transition-all duration-300 transform"
        >
          {/* Ambient Glow behind jar */}
          <div className="absolute inset-x-8 inset-y-12 bg-[#800020]/25 rounded-full blur-[48px] group-hover:bg-[#800020]/40 transition-colors duration-500" />
          
          {/* Jar Lid (Wood/Burgundy velvet styling) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-8 bg-[#800020] rounded-lg z-30 shadow-[inset_0_-3px_8px_rgba(0,0,0,0.8),0_4px_8px_rgba(0,0,0,0.6)] border border-[#ffb3b5]/20 flex items-center justify-center">
            <div className="w-40 h-1 bg-[#ffb3b5]/20 rounded" />
          </div>

          {/* Golden Cord neck decorative ribbon */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[148px] h-1.5 bg-[#debfc2] rounded z-30 border-y border-[#ffb3b5]/30 shadow-md flex justify-center items-center">
             <div className="w-3 h-3 bg-[#debfc2] rotate-45 border-l border-t border-[#ffb3b5]/40 -bottom-1 absolute rounded-sm" />
          </div>

          {/* Jar Body */}
          <div className="absolute inset-0 glass-jar flex flex-col items-center justify-center overflow-hidden">
            {/* Soft pink core magical lights inside the jar */}
            <div className="absolute inset-4 bg-gradient-to-t from-[#800020]/30 to-[#ffb3b5]/10 rounded-full blur-2xl opacity-80" />

            {/* Glowing particle stars */}
            {internalStars.map((star) => (
              <button
                key={star.id}
                onClick={(e) => handleStarClick(e)}
                style={{
                  left: `${star.left}%`,
                  bottom: `${star.bottom}%`,
                  '--tx': `${star.driftX}px`,
                  '--ty': `${star.driftY}px`,
                  animationDelay: `${star.delay}s`,
                } as any}
                className="absolute text-yellow-300 drop-shadow-[0_0_10px_#ffd700] hover:scale-135 active:scale-90 transition-transform cursor-pointer hover:text-white duration-150 animate-float-star z-20 p-2"
              >
                <Star size={18} className="fill-current text-amber-300 hover:text-white transition-colors" />
              </button>
            ))}
          </div>

          {/* Label on Jar */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#2e0409]/80 border border-[#ffb3b5]/35 py-1 px-4 rounded-md backdrop-blur-md shadow-lg z-20">
            <span className="font-handwriting text-md tracking-wider text-[#ffb3b5]">Our Sanctuary</span>
          </div>
        </div>

        {/* Released drifting rising stars overlay */}
        {releasedStars.map((star) => (
          <button
            key={star.id}
            onClick={(e) => handleStarClick(e)}
            style={{
              left: `${star.left}%`,
              bottom: `calc${star.bottom}%`,
              transform: 'translateX(-50%)',
              '--ex': `${star.ex}px`,
              '--ey1': `${star.ey1}px`,
              '--ey2': `${star.ey2}px`,
            } as any}
            className="absolute z-45 animate-star-release text-yellow-300 drop-shadow-[0_0_18px_#ffd700] hover:scale-125 cursor-pointer"
          >
            <Star size={24} className="fill-current text-yellow-300" />
          </button>
        ))}
      </main>

      {/* Letter Scroll Overlay bottom sliding card */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-2/3 max-h-[500px] z-50 rounded-t-[3rem] p-8 bg-[#1a1c1c] border-t-8 border-[#800020] transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          activeMessage ? 'translate-y-0 shadow-[0_-12px_60px_rgba(0,0,0,0.9)]' : 'translate-y-full'
        }`}
      >
        <div className="max-w-md mx-auto h-full flex flex-col items-center justify-between">
          {/* Rounded swipe indicator pill */}
          <button
            onClick={() => setActiveMessage(null)}
            className="w-16 h-1 bg-[#333535] rounded-full cursor-pointer hover:bg-[#ffb3b5]/40 transition-colors"
            title="Slide Down"
          />

          <div className="flex-1 flex items-center justify-center text-center py-6 px-4">
            <p className="font-handwriting text-2xl sm:text-3xl text-[#e3e2e2] leading-relaxed drop-shadow-sm select-all">
              {activeMessage}
            </p>
          </div>

          <div className="w-full text-center pb-4 flex flex-col items-center justify-center gap-1">
            <span className="text-[#800020] text-3xl animate-pulse">❦</span>
            <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#e0bfbf] opacity-60">Handwritten For Isha</span>
          </div>
        </div>
      </div>
    </div>
  );
}
