import React, { useState, useEffect } from 'react';
import { Gamepad2, Heart, Award, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryCard } from '../types';

interface DistractionViewProps {
  onBack: () => void;
}

import { IMAGE_PATHS } from '../imageList';

const sortedImagePaths = [...IMAGE_PATHS].sort();

const ISHA_PHOTOS = sortedImagePaths.filter((path) => typeof path === 'string' && !path.includes('chibi'));
const HEART_POP_PHOTOS = sortedImagePaths.filter((path) => typeof path === 'string' && !path.includes('chibi'));


// Generate 10 unique pairs using beautiful photos of Isha for the 5x4 grid game (instead of emojis)
const MEMORY_ITEMS = Array.from({ length: 10 }).map((_, idx) => {
  const photoUrl = ISHA_PHOTOS[idx % ISHA_PHOTOS.length] || '';
  return {
    symbol: `isha_match_${idx}`,
    label: `Beautiful Isha #${idx + 1}`,
    imageUrl: photoUrl
  };
});

const BOYFRIEND_QUOTES = [
  "You nailed it, sweet girl! Proud of you. 🌹",
  "A perfect match, just like us! ❤️",
  "A happy smile suits you best. Keep going! 🥰",
  "Success! I am cheering for you from here. 🥳",
  "Each sweet match represents a custom hug I made for you! 🫂",
  "Bravo! You cleared my sanctuary game perfectly, my queen. 👑"
];

interface Bubble {
  id: number;
  x: number; // percentage left
  y: number; // percentage top
  size: number;
  speedY: number;
  color: string;
}

// Sparkle/Burst photo splash when a bubble is popped
interface PoppedPhotoSplash {
  id: number;
  x: number;
  y: number;
  imageUrl: string;
}

export default function DistractionView({ onBack }: DistractionViewProps) {
  const [activeTab, setActiveTab] = useState<'memory' | 'bubbles'>('memory');

  // Memory Game States (Expanded to 4x4, 16 cards total)
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [gameFeedback, setGameFeedback] = useState('Match all the warm pairs of emojis and photos to unlock special notes...');

  // Bubble Popper States
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [poppedSplashes, setPoppedSplashes] = useState<PoppedPhotoSplash[]>([]);

  // Play crystalline pop chimes
  const playPopTone = (freq: number) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);

      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch (e) { }
  };

  const initMemoryGame = () => {
    // Duplicate symbols to create pairs (total 16 cards for 4x4 board)
    const itemPack = [...MEMORY_ITEMS, ...MEMORY_ITEMS]
      .map((item, idx) => ({
        id: idx,
        symbol: item.symbol,
        label: item.label,
        isFlipped: false,
        isMatched: false,
        imageUrl: item.imageUrl
      }))
      // Simple random shuffle
      .sort(() => Math.random() - 0.5);

    setCards(itemPack);
    setSelectedCardIndices([]);
    setMatchesCount(0);
    setGameFeedback('Match all the warm pairs of emojis and photos to unlock special notes...');
  };

  useEffect(() => {
    initMemoryGame();
  }, []);

  const handleCardClick = (clickedIndex: number) => {
    const clickedCard = cards[clickedIndex];
    if (clickedCard.isFlipped || clickedCard.isMatched || selectedCardIndices.length >= 2) return;

    // Play visual pick sound tone
    const pitches = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00];
    playPopTone(pitches[Math.floor(Math.random() * pitches.length)]);

    // Flip card
    const updatedCards = [...cards];
    updatedCards[clickedIndex].isFlipped = true;
    setCards(updatedCards);

    const newIndices = [...selectedCardIndices, clickedIndex];
    setSelectedCardIndices(newIndices);

    if (newIndices.length === 2) {
      const [firstIdx, secondIdx] = newIndices;
      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        // Matched
        setTimeout(() => {
          const matchedCardSet = [...cards];
          matchedCardSet[firstIdx].isMatched = true;
          matchedCardSet[secondIdx].isMatched = true;
          setCards(matchedCardSet);
          setSelectedCardIndices([]);

          const newMatches = matchesCount + 1;
          setMatchesCount(newMatches);

          // Trigger high pitch success
          playPopTone(523.25);

          if (newMatches === MEMORY_ITEMS.length) {
            setGameFeedback("Congratulations Isha! You've matched all the love items! ❤️ " + BOYFRIEND_QUOTES[Math.floor(Math.random() * BOYFRIEND_QUOTES.length)]);
          } else {
            setGameFeedback(BOYFRIEND_QUOTES[Math.floor(Math.random() * BOYFRIEND_QUOTES.length)]);
          }
        }, 500);
      } else {
        // Not matched, flip them back
        setTimeout(() => {
          const revertCardSet = [...cards];
          revertCardSet[firstIdx].isFlipped = false;
          revertCardSet[secondIdx].isFlipped = false;
          setCards(revertCardSet);
          setSelectedCardIndices([]);
        }, 1000);
      }
    }
  };

  // --- Bubble Popper Engine ---
  const launchBubbles = () => {
    const bubbleMix = Array.from({ length: 9 }, (_, idx) => ({
      id: Date.now() + idx,
      x: 10 + Math.random() * 80, // left percentage
      y: 110, // starts below screen container bounds
      size: Math.random() * 32 + 28, // slightly larger bubble sizes
      speedY: Math.random() * 1.3 + 0.7,
      color: `rgba(255, 171, 243, ${Math.random() * 0.22 + 0.18})`
    }));
    setBubbles(bubbleMix);
  };

  useEffect(() => {
    if (activeTab === 'bubbles') {
      launchBubbles();
    }
  }, [activeTab]);

  // Bubble animation updater loop
  useEffect(() => {
    if (activeTab !== 'bubbles' || bubbles.length === 0) return;

    const loop = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speedY }))
          // Float wrap reset on top overflow
          .map((b) => (b.y < -15 ? { ...b, y: 110, x: 10 + Math.random() * 80 } : b))
      );
    }, 30);

    return () => clearInterval(loop);
  }, [bubbles, activeTab]);

  const popBubble = (id: number, x: number, y: number, size: number) => {
    // Score scaling with bubble size density
    setScore((prev) => prev + Math.floor(70 / size) * 10);

    // Play warm acoustic chime scale
    playPopTone(440 + Math.floor(Math.random() * 350));

    // Choose random photo of Isha to splash burst (new WhatsApp 2026-05-30 images)
    const randomPhoto = HEART_POP_PHOTOS[Math.floor(Math.random() * HEART_POP_PHOTOS.length)];

    const newSplash: PoppedPhotoSplash = {
      id: Date.now() + Math.random(),
      x,
      y,
      imageUrl: randomPhoto
    };

    setPoppedSplashes((p) => [...p, newSplash]);

    // Despawn/Reposition matching element
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, y: 115, x: 10 + Math.random() * 80 } : b))
    );

    // Fade out splash after 1.5s
    setTimeout(() => {
      setPoppedSplashes((p) => p.filter((splash) => splash.id !== newSplash.id));
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-start px-6 pb-26 relative overflow-y-auto select-none">
      {/* Back to Garden Ribbon */}
      <button
        onClick={onBack}
        className="fixed top-0 left-4 sm:left-8 z-50 bg-[#800020] text-[#ffdada] px-4 py-2 hover:py-2.5 rounded-b-xl shadow-xl flex flex-row items-center gap-2 transition-all cursor-pointer border-x border-b border-[#ffb3b5]/30 group active:scale-95"
      >
        <span className="text-xs group-hover:-translate-x-0.5 transition-transform">◀</span>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase">
          Garden
        </span>
      </button>

      {/* Main Container workspace */}
      <main className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center py-20 gap-8">
        <header className="text-center">
          <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            I Need a Distraction
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#e0bfbf] max-w-sm mx-auto leading-relaxed">
            Let's play a sweet, relaxing game together. Both games feature beautiful moments of yours to make you smile!
          </p>
        </header>

        {/* Tab Selection */}
        <div className="flex bg-[#1a1c1c]/95 p-1.5 rounded-full border border-[#ffb3b5]/15 w-full max-w-xs justify-center items-center gap-1.5 shadow-2xl">
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === 'memory'
                ? 'bg-[#800020] text-[#ffdada] shadow-md'
                : 'text-[#e3e2e2]/70 hover:text-white hover:bg-[#292a2a]/40'
              }`}
          >
            Match Board
          </button>
          <button
            onClick={() => setActiveTab('bubbles')}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === 'bubbles'
                ? 'bg-[#800020] text-[#ffdada] shadow-md'
                : 'text-[#e3e2e2]/70 hover:text-white hover:bg-[#292a2a]/40'
              }`}
          >
            Heart Pop
          </button>
        </div>

        {/* Tab 1: Memory Matching Board */}
        {activeTab === 'memory' && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="text-center font-sans text-sm text-[#ffdada] min-h-[56px] flex items-center justify-center max-w-md bg-[#1a1c1c]/70 px-6 py-2.5 rounded-2xl border border-[#ffb3b5]/15 shadow-inner">
              {gameFeedback}
            </div>

            {/* Bigger Board Design - 5 rows and 4 columns */}
            <div className="grid grid-cols-4 gap-3 max-w-md w-full px-2">
              {cards.map((card, idx) => (
                <button
                  key={card.id}
                  id={`memory-card-${idx}`}
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-square rounded-2xl border flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer shadow-lg relative overflow-hidden ${card.isFlipped || card.isMatched
                      ? 'bg-[#800020]/20 border-[#ffb3b5]/40 rotate-0'
                      : 'bg-[#1a1c1c] border-[#ffb3b5]/10 hover:border-[#ffb3b5]/30 rotate-180 hover:scale-105'
                    }`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#800020]/25 to-transparent opacity-40 pointer-events-none" />

                  {card.isFlipped || card.isMatched ? (
                    card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.label}
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-4xl filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">{card.symbol}</span>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center rotate-180 text-center gap-1">
                      <Heart className="text-[#ffabf3] opacity-40 fill-current animate-pulse" size={24} />
                      <span className="text-[8px] uppercase tracking-widest text-[#ffb3b5] opacity-30 font-semibold">Love</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={initMemoryGame}
              className="mt-2 text-xs uppercase tracking-widest font-semibold text-[#ffb3b5] border border-[#ffb3b5]/35 rounded-full px-6 py-2.5 hover:bg-[#800020]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={12} className="inline-block animate-[spin_8s_linear_infinite]" />
              Shuffle & Try Again
            </button>
          </div>
        )}

        {/* Tab 2: Therapeutic Worry Popper */}
        {activeTab === 'bubbles' && (
          <div className="w-full max-w-xl bg-[#1a1c1c]/60 rounded-3xl p-6 border border-[#ffb3b5]/15 shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden min-h-[460px]">
            {/* Ambient bubble game instructions */}
            <div className="w-full flex justify-between items-center z-10 px-2 border-b border-[#ffb3b5]/10 pb-4">
              <span className="text-xs uppercase font-semibold text-[#e0bfbf] tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#ffabf3]" />
                Happiness Popped: <strong className="text-white text-md ml-1">{score}</strong>
              </span>
              <button
                onClick={() => setScore(0)}
                className="text-[10px] uppercase font-bold text-[#ffdada] tracking-wider px-3 py-1.5 rounded-full border border-[#ffb3b5]/20 hover:border-[#ffb3b5]/50 hover:bg-[#800020]/40 transition-all cursor-pointer"
              >
                Reset score
              </button>
            </div>

            {/* Stage bounds: Bigger and taller for beautiful visibility */}
            <div className="relative w-full h-[360px] rounded-2xl bg-[#0e0f0f]/50 overflow-hidden border border-dashed border-[#ffb3b5]/15 shadow-inner">
              {bubbles.map((b) => (
                <button
                  key={b.id}
                  onClick={() => popBubble(b.id, b.x, b.y, b.size)}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.size}px`,
                    height: `${b.size}px`,
                    backgroundColor: b.color,
                  }}
                  className="absolute rounded-full border border-white/20 shadow-inner flex items-center justify-center active:scale-125 transition-transform cursor-pointer hover:border-white/40"
                >
                  <Heart size={b.size * 0.45} className="text-[#ffabf3] opacity-60 fill-current animate-pulse" />
                </button>
              ))}

              {/* Spectacular floating image bursts overlaid inside container */}
              <AnimatePresence>
                {poppedSplashes.map((splash) => (
                  <motion.div
                    key={splash.id}
                    initial={{ scale: 0.2, opacity: 0, y: 10, rotate: -15 }}
                    animate={{ scale: 1.1, opacity: 1, y: -50, rotate: 5 }}
                    exit={{ scale: 0.7, opacity: 0, y: -90 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                      left: `${splash.x}%`,
                      top: `${splash.y}%`,
                    }}
                    className="absolute pointer-events-none z-30"
                  >
                    <div className="p-1.5 bg-[#800020] rounded-2xl border-2 border-[#ffabf3]/60 shadow-[0_10px_25px_rgba(128,0,32,0.6)] overflow-hidden w-20 h-20 sm:w-24 sm:h-24">
                      <img
                        src={splash.imageUrl}
                        alt="Sweetest memory popped"
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating overlay miniature heart */}
                      <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white text-white font-bold shadow-lg animate-bounce">💖</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {bubbles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <p className="text-xs text-[#e0bfbf]/70 italic font-sans max-w-xs leading-relaxed">
                    Pop any rising heart bubble of your worries to unleash a beautiful photo memory of yours! Let it fill your screen with love.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}