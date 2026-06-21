import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
interface ComfortViewProps {
  onBack: () => void;
}

import chibiHug from '../assets/chibi_hug.png';
import chibiKiss1 from '../assets/chibi_kiss1.png';
import chibiKiss2 from '../assets/chibi_kiss2.jpeg';

const CHIBI_ASSETS = {
  hug: chibiHug,
  kiss1: chibiKiss1,
  kiss2: chibiKiss2
};

export default function ComfortView({ onBack }: ComfortViewProps) {
  const [holdPercent, setHoldPercent] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [comfortStage, setComfortStage] = useState<'hold' | 'hug' | 'kiss1' | 'kiss2'>('hold');
  const [statusMessage, setStatusMessage] = useState('Touch and hold the circle below to hold hands and feel my hug...');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play standard Web Audio chimes
  const triggerHapticChime = (pitch: number, isVib = false) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const audioCtx = new AudioCtxClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      }
      if (isVib && navigator.vibrate) {
        navigator.vibrate([80, 20, 80]);
      }
    } catch (e) {}
  };

  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    triggerHapticChime(440, true);
    setStatusMessage("Closing your eyes... I'm holding you close.");

    let progress = 0;
    setHoldPercent(0);

    intervalRef.current = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        setHoldPercent(100);
        clearInterval(intervalRef.current!);
        completeHold();
      } else {
        setHoldPercent(progress);
        // Play soft pulsing sound pitch raising as you hold
        if (progress % 20 === 0) {
          triggerHapticChime(440 + (progress * 2), true);
        }
      }
    }, 100);
  };

  const handleHoldEnd = () => {
    if (isHolding) {
      setIsHolding(false);
      setHoldPercent(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (comfortStage === 'hold') {
        setStatusMessage('Touch and hold the circle below to hold hands and feel my hug...');
      }
    }
  };

  const completeHold = () => {
    setIsHolding(false);
    triggerHapticChime(659.25, true); // High sweet bell pitch E5
    setComfortStage('hug');
    setStatusMessage("I'm right here with you, my princess.");
  };

  const progressKiss = () => {
    triggerHapticChime(783.99, true); // Kiss bell chime G5
    if (comfortStage === 'hug') {
      setComfortStage('kiss1');
      setStatusMessage('A warm, sweet kiss for you to chase the worries away...');
    } else if (comfortStage === 'kiss1') {
      setComfortStage('kiss2');
      setStatusMessage('Holding you close. I love you so much, Isha. Always.');
    } else {
      // reset back
      setComfortStage('hold');
      setHoldPercent(0);
      setStatusMessage('Touch and hold the circle below to hold hands and feel my hug...');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-start px-6 pb-24 relative overflow-y-auto select-none">
      {/* Navigation Garden Tab */}
      <nav className="fixed top-6 left-0 z-50">
        <button
          onClick={onBack}
          className="bg-[#800020] text-[#ffdadb] px-5 py-2.5 rounded-r-full shadow-lg flex items-center gap-2 hover:bg-[#8e0f28] hover:text-white transition-all duration-300 transform active:scale-95 border-y border-r border-[#ffb3b5]/30 cursor-pointer text-sm font-semibold"
        >
          <span>▲</span>
          <span className="font-sans text-xs uppercase tracking-wider">Garden</span>
        </button>
      </nav>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full transition-all duration-500">
        <div className="text-center w-full mt-4">
          <h1 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-4 drop-shadow-[0_2px_8px_rgba(128,0,32,0.6)]">
            I Need Comfort
          </h1>
          <p className="text-[#e0bfbf] italic text-xs sm:text-sm mb-12 min-h-[48px] flex items-center justify-center transition-all duration-500 font-sans max-w-sm mx-auto leading-relaxed">
            {statusMessage}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {comfortStage === 'hold' ? (
            <motion.div
              key="hold-action"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative flex flex-col items-center justify-center min-h-[300px]"
            >
              {/* hold touch interactive trigger */}
              <div
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className="w-44 h-44 bg-[#1a1c1c] rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-[#ffb3b5]/20 hover:border-[#ffb3b5]/40 select-none active:scale-95 transition-all duration-150 relative cursor-pointer group"
              >
                {/* Hold completion radial indicator */}
                <div 
                  style={{ clipPath: `inset(${(100 - holdPercent)}% 0px 0px 0px)` }}
                  className="absolute inset-0 bg-[#ff828a]/10 rounded-full transition-all duration-100" 
                />

                <span className="text-5xl mb-2 filter drop-shadow-[0_0_8px_rgba(255,179,181,0.5)] group-hover:scale-110 transition-transform">
                  🫂
                </span>
                <span className="font-bold text-[#ffb3b5] tracking-widest text-xs uppercase z-10">
                  {isHolding ? `${holdPercent}%` : 'Hold Me'}
                </span>

                {/* Soft pulse animated circles */}
                <div className="absolute inset-0 bg-[#800020]/20 rounded-full animate-pulse-slow -z-10 shadow-[0_0_30px_rgba(128,0,32,0.3)]" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="comfort-reveal"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm"
            >
              {/* Polaroid Frame style decoration and fallback handling */}
              <div className="bg-white p-4 pb-8 w-full aspect-square flex flex-col items-center justify-between shadow-[0_15px_45px_rgba(0,0,0,0.6)] relative overflow-hidden rounded-xl border border-white/20 animate-bounce-up">
                
                {/* Visual Image container with nice border blend */}
                <div className="w-full flex-1 relative bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={comfortStage === 'hug' ? CHIBI_ASSETS.hug : comfortStage === 'kiss1' ? CHIBI_ASSETS.kiss1 : CHIBI_ASSETS.kiss2}
                    alt="Comfort illustration"
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] max-h-[190px]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Polaroid handwritten title caption */}
                <div className="pt-4 text-center">
                  <span className="font-handwriting text-2xl text-[#1e2020] tracking-wide select-none">
                    {comfortStage === 'hug' && "A warm hug for Isha! 🫂"}
                    {comfortStage === 'kiss1' && "A soft kiss list! 💋"}
                    {comfortStage === 'kiss2' && "Sending you infinite love... ❤️"}
                  </span>
                </div>
              </div>

              {/* Action Progress Cycle button */}
              <button
                onClick={progressKiss}
                className="bg-[#800020] text-[#ffdadb] hover:bg-[#8e0f28] hover:text-white px-12 py-4 rounded-full font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs border border-[#ffb3b5]/25 cursor-pointer"
              >
                {comfortStage === 'hug' && 'Get a Kiss 💋'}
                {comfortStage === 'kiss1' && 'Another Kiss 😘'}
                {comfortStage === 'kiss2' && 'Hug Again ❤️'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
export { CHIBI_ASSETS };
