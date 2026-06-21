import React, { useState } from 'react';
import { Heart, Sparkles, X, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScrapbookViewProps {
  onBack: () => void;
}

interface ScrapbookImage {
  url: string;
  caption: string;
  date?: string;
  theme?: string;
}

import { IMAGE_PATHS } from '../imageList';

const sortedImagePaths = [...IMAGE_PATHS]
  .filter((path) => typeof path === 'string' && !path.includes('chibi'))
  .sort();

const CAPTIONS = [
  'Purest joy! Your smile brightens up my whole world. ❤️',
  'You look so incredibly breathtaking here. My absolute slay queen. 👑',
  'Unmatched elegance. I am so lucky to have you. 🌹',
  'That gorgeous gaze that melts my heart every single time. 😍',
  'Soft, sweet, and unbelievably cute. Sending you infinite hugs. 🫂',
  'A moment captured in perfection. You are my dream come true. ✨',
  'Your warmth radiates through every single photograph. 💖',
  'Charming, sweet, and everything I ever wished for. 🧸',
  'A truly beautiful soul. I love you more and more each day. 🌸',
  'My heart skips a beat whenever I look at you. 🥰',
  'Our peaceful sanctuary begins and ends with you. 🏠',
  'Stunning as always. No words can describe your beauty. ✨',
  'Your comfort is my goal. You are my everything, Isha. 🫂',
  'Soft rose petals surrounding the most beautiful flower. 🌹',
  'My sanctuary and my absolute peace. I love you to the moon and back. 🌙',
  'Incredible poise. Beautiful in every single way. 🌸',
  'Your sweet smile is all the healing I ever need. ❤️',
  'Looking so adorable in this pink embroidered look. 💖',
  'Forever mine, forever cherished, forever loved. 👑',
  'The prettiest eyes looking straight into my soul. ✨',
  'Every moment with you is a treasure I hold dear. 🫂',
  'Breathtakingly gorgeous look! Absolutely stunning. 😍',
  'Sweetness level: infinite! I cannot stop smiling! 🥰',
  'So chic and high fashion. My beautiful supermodel! 👑✨',
  'My peaceful sanctuary harbor. Home is truly wherever you are. ❤️',
  'Thank you for being you, my gorgeous girl. Forever and always! 🌹',
  'You are the sunshine that starts my day and the moonlight that guides my dreams. ☀️🌙',
  'Blowing you million kisses! You are my absolute favorite distraction. 😘',
  'With you, every single second feels like a fairy tale. 📖✨',
  'My heartbeat, my peace, my home. I am forever captivated by you. 💓',
  'Just looking at you makes me want to squeeze you tight. Cutest girl alive! 🐹',
  'You light up my life in ways nobody else ever could. Forever yours. ♾️❤️'
];

const MEMORIES: ScrapbookImage[] = sortedImagePaths.map((path, idx) => {
  return {
    url: path,
    caption: CAPTIONS[idx % CAPTIONS.length],

    date: `Happy Memory #${idx + 1}`
  };
});

interface SparkleHeart {
  id: number;
  x: number;
  y: number;
}

export default function ScrapbookView({ onBack }: ScrapbookViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hearts, setHearts] = useState<SparkleHeart[]>([]);

  // Sound generator helper (warm love harp chime)
  const playHarpChime = (freq: number) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) { }
  };

  const handlePolaroidClick = (index: number) => {
    setSelectedIndex(index);
    playHarpChime(523.25); // high crisp E harp 
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    const nextIdx = (selectedIndex + 1) % MEMORIES.length;
    setSelectedIndex(nextIdx);
    playHarpChime(587.33);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    const prevIdx = (selectedIndex - 1 + MEMORIES.length) % MEMORIES.length;
    setSelectedIndex(prevIdx);
    playHarpChime(440.00);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Spawn a beautiful floating heart at click coordinate
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newHeart: SparkleHeart = {
      id: Date.now() + Math.random(),
      x,
      y
    };

    setHearts((prev) => [...prev, newHeart]);
    playHarpChime(440 + Math.random() * 200);

    // Remove heart after animation
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-start px-4 sm:px-6 pb-26 relative overflow-y-auto select-none">
      {/* Back Ribbon Tab */}
      <button
        onClick={onBack}
        className="fixed top-0 left-4 sm:left-8 z-40 bg-[#800020] text-[#ffdada] px-4 py-2 hover:py-2.5 rounded-b-xl shadow-xl flex flex-row items-center gap-2 transition-all cursor-pointer border-x border-b border-[#ffb3b5]/30 group active:scale-95"
      >
        <span className="text-xs group-hover:-translate-x-0.5 transition-transform">◀</span>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase">
          Garden
        </span>
      </button>

      {/* Primary Workspace */}
      <main className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center py-20 gap-8">
        <header className="text-center max-w-md mx-auto">
          <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Our Scrapbook
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#e0bfbf] leading-relaxed">
            A safe, gorgeous Polaroid book full of your beautiful smile. Tap any card to open up the love notes!
          </p>
        </header>

        {/* Polaroid Memory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full px-2 mt-4">
          {MEMORIES.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, rotate: (idx % 2 === 0 ? -1.5 : 1.5) }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ scale: 1.03, rotate: (idx % 2 === 0 ? 1 : -1), zIndex: 10 }}
              transition={{ duration: 0.4 }}
              onClick={() => handlePolaroidClick(idx)}
              className="bg-white p-4 pb-6 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] cursor-pointer border border-[#ffb3b5]/15 flex flex-col items-center gap-3 relative transform transition-all group"
            >
              {/* Top tape piece realistic touch */}
              <div className="absolute -top-3 w-16 h-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm rotate-3 border-x border-dashed border-white/40 pointer-events-none shadow-sm" />

              {/* Image Frame */}
              <div className="w-full aspect-square bg-[#0f1010]/5 rounded overflow-hidden relative">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* Caption & Date text */}
              <div className="w-full text-center flex flex-col items-center pt-1 px-1">
                <span className="font-handwriting text-lg text-neutral-800 leading-normal line-clamp-1 block select-none">
                  {item.caption}
                </span>
                <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-neutral-400 mt-1 select-none flex items-center gap-1">
                  <Calendar size={10} />
                  {item.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Immersive Photo Detail Overlay View */}
        <AnimatePresence>
          {selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setSelectedIndex(null)}
            >
              <div
                className="relative max-w-lg w-full bg-white rounded-2xl p-4 sm:p-5 pb-8 shadow-[0_25px_60px_black] border border-white/20 flex flex-col items-center gap-4 cursor-default transform animate-bounce-up"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOverlayClick(e);
                }}
              >
                {/* Floating Heart burst generator effect inside modal clicks */}
                <AnimatePresence>
                  {hearts.map((h) => (
                    <motion.span
                      key={h.id}
                      initial={{ scale: 0.3, opacity: 1, y: 0 }}
                      animate={{ scale: 1.8, opacity: 0, y: -100, rotate: Math.random() * 60 - 30 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        left: `${h.x}px`,
                        top: `${h.y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="text-pink-500 text-3xl pointer-events-none select-none z-40 drop-shadow-[0_4px_10px_rgba(236,72,153,0.5)]"
                    >
                      ❤️
                    </motion.span>
                  ))}
                </AnimatePresence>

                {/* Close Button top-right */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#800020] text-[#ffdada] border-2 border-[#ffb3b5]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-xl cursor-pointer z-50"
                  title="Close Detail"
                >
                  <X size={18} />
                </button>

                {/* Left navigation arrow button */}
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/45 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer z-40"
                  title="Previous Memory"
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Right navigation arrow button */}
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/45 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer z-40"
                  title="Next Memory"
                >
                  <ChevronRight size={22} />
                </button>

                {/* Top status indicator bubble */}
                <div className="absolute top-4 left-5 bg-[#800020] text-[#ffdada] text-[10px] font-mono px-3 py-1 rounded-full border border-[#ffb3b5]/30 shadow-md">
                  {selectedIndex + 1} / {MEMORIES.length}
                </div>

                {/* Polaroid core picture displayed high-res */}
                <div className="w-full aspect-[4/5] sm:aspect-square bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200/40 relative shadow-inner flex items-center justify-center">
                  <img
                    src={MEMORIES[selectedIndex].url}
                    alt="Detail view memoir"
                    className="w-full h-full object-cover transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onClick={(e) => {
                      // Click on image spawns heart as well through event bubble
                    }}
                  />

                  {/* Watermark brand element placeholder */}
                  <span className="absolute bottom-2 right-3 text-[10px] uppercase font-mono tracking-widest text-white/30 font-semibold select-none">Isha × Sanctuary</span>
                </div>

                {/* Handwritten details bottom Area */}
                <div className="text-center py-2 px-4 max-w-xs flex flex-col items-center justify-center gap-1.5">
                  <span className="font-handwriting text-2xl sm:text-3xl text-neutral-800 leading-relaxed block select-all">
                    "{MEMORIES[selectedIndex].caption}"
                  </span>

                  <span className="text-[10px] font-sans uppercase font-bold text-[#800020] tracking-[0.25em] flex items-center gap-1.5 mt-1">
                    <Sparkles size={11} className="text-pink-500 animate-pulse" />
                    Boyfriend's Heart Note
                  </span>

                  <span className="text-[8px] font-mono text-neutral-400 mt-0.5">TAP ANYWHERE TO SHOWER HEARTS</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}