import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface BirthdayViewProps {
  onBack: () => void;
}

export default function BirthdayView({ onBack }: BirthdayViewProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Target date: July 15, 2026 at midnight local time
    const targetDate = new Date('2026-07-15T00:00:00');

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsUnlocked(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsUnlocked(false);
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const m = Math.floor((difference / 1000 / 60) % 60);
        const s = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col justify-start px-6 pb-26 relative overflow-y-auto select-none">
      {/* Back Ribbon Tab */}
      <button
        onClick={onBack}
        className="fixed top-0 left-4 sm:left-8 z-50 bg-[#800020] text-[#ffdada] px-4 py-2 hover:py-2.5 rounded-b-xl shadow-xl flex flex-row items-center gap-2 transition-all cursor-pointer border-x border-b border-[#ffb3b5]/30 group active:scale-95"
      >
        <span className="text-xs group-hover:-translate-x-0.5 transition-transform">◀</span>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase">
          Garden
        </span>
      </button>

      {/* Primary Workspace */}
      <main className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-20 min-h-screen">
        {!isUnlocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full flex flex-col items-center gap-8 text-center"
          >
            {/* Title */}
            <div>
              <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                A Secret Gift
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#e0bfbf] max-w-md mx-auto leading-relaxed">
                Something magical is being prepared for you...
              </p>
            </div>

            {/* Glowing Floating Gift Container */}
            <motion.div
              animate={{
                y: [0, -16, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 5,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
              className="relative w-44 h-44 flex items-center justify-center bg-gradient-to-tr from-[#800020]/20 to-[#ffabf3]/10 rounded-full border border-[#ffb3b5]/25 shadow-[0_0_50px_rgba(255,171,243,0.15)] group"
            >
              {/* Inner glowing rings */}
              <div className="absolute inset-2 rounded-full border border-dashed border-[#ffabf3]/30 animate-spin-slow" />
              
              {/* Floating icon */}
              <div className="text-6xl filter drop-shadow-[0_4px_12px_rgba(128,0,32,0.6)] text-[#ffb3b5] group-hover:scale-110 transition-transform duration-500">
                🎁
              </div>
            </motion.div>

            {/* Live Countdown Timer Grid */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md w-full px-2">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds },
              ].map((item, index) => (
                <div
                  key={index}
                  className="glass-card-custom rounded-2xl py-4 flex flex-col items-center justify-center border border-[#ffb3b5]/15 shadow-xl"
                >
                  <span className="font-serif text-3xl sm:text-4xl text-[#ffdada] font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#ffb3b5] uppercase tracking-wider mt-1.5 font-sans">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Sweet Teaser Card */}
            <div className="w-full glass-card-custom rounded-3xl p-6 sm:p-8 border border-[#ffb3b5]/10 max-w-lg shadow-2xl">
              <p className="font-handwriting text-2xl sm:text-3xl text-white/90 leading-relaxed italic">
                "Patience, princess! No peeking until the clock strikes midnight on July 15th. 🤫✨"
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="glass-card-custom rounded-3xl p-8 border border-[#ffabf3]/25 bg-[#1e2020]/80 shadow-[0_0_50px_rgba(128,0,32,0.3)]">
              <div className="w-16 h-16 bg-[#ffabf3]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#ffabf3]/20">
                <span className="text-[#ffabf3] text-3xl animate-bounce">🎂</span>
              </div>
              <h3 className="font-serif italic text-3xl text-[#ffb3b5] mb-4">Happy Birthday, Isha! ❤️</h3>
              <p className="font-handwriting text-2xl sm:text-3xl text-white/95 leading-relaxed italic px-2 mb-8">
                "Your special secret birthday letter and gift are unlocking in Phase 2! Stay tuned..."
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
