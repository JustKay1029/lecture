import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import sunflowerMp3 from '../assets/Post_Malone_Swae_Lee_-_Sunflower_Spider-Man_Into_The_Spider-Verse_(mp3.pm).mp3';

// Import the 5 memory photos
import photo1 from '../assets/WhatsApp Image 2026-05-25 at 20.06.30 (1).jpeg';
import photo2 from '../assets/WhatsApp Image 2026-05-25 at 20.06.31.jpeg';
import photo3 from '../assets/WhatsApp Image 2026-05-25 at 20.06.34.jpeg';
import photo4 from '../assets/WhatsApp Image 2026-05-25 at 20.06.37.jpeg';
import photo5 from '../assets/WhatsApp Image 2026-05-25 at 20.06.39.jpeg';

interface BirthdayViewProps {
  onBack: () => void;
}

type Stage = 'countdown' | 'cake' | 'unwrap' | 'letter';

const SUNFLOWER_LYRICS = [
  { time: 0, text: "🎵 Sunflower - Post Malone & Swae Lee 🎵" },
  { time: 1.5, text: "Needless to say, I keep her in check" },
  { time: 4.8, text: "She was a bad-bad, nevertheless" },
  { time: 8.0, text: "Callin' it quits now, baby, I'm a wreck" },
  { time: 11.0, text: "Crash at my place, baby, you're a wreck" },
  { time: 14.5, text: "Needless to say, I'm keeping in check" },
  { time: 17.5, text: "She was a bad-bad, nevertheless" },
  { time: 20.8, text: "Callin' it quits now, baby, I'm a wreck" },
  { time: 24.0, text: "Crash at my place, baby, you're a wreck" },
  { time: 27.2, text: "Thinking in a bad way, losing your grip" },
  { time: 30.5, text: "Screaming at my face, baby, don't trip" },
  { time: 33.8, text: "Someone took a big L, don't know how that felt" },
  { time: 37.0, text: "Looking at you sideways, party on tilt" },
  { time: 40.5, text: "Ooh-ooh, some things you just can't refuse" },
  { time: 46.5, text: "She wanna ride me like a cruise and I'm not tryna lose" },
  { time: 52.8, text: "Then you're left in the dust, unless I stuck by ya" },
  { time: 59.8, text: "You're a sunflower, I think your love would be too much" },
  { time: 66.2, text: "Or you'll be left in the dust, unless I stuck by ya" },
  { time: 72.8, text: "You're the sunflower, you're the sunflower" },
  { time: 79.5, text: "Every time I'm leaving on you, you don't make it easy, no, no" },
  { time: 86.2, text: "Wish I could be there for you, give me a reason to, oh" },
  { time: 93.0, text: "Go on, go on, let me get you on the phone" },
  { time: 96.5, text: "We can talk about it, baby, write it down in stone" },
  { time: 99.8, text: "Let me let you go, let me let you slide" },
  { time: 103.2, text: "Never let you down, never leave your side" },
  { time: 106.5, text: "Know you want it all, know you want it now" },
  { time: 109.8, text: "Tell me when to go, tell me when to bounce" },
  { time: 113.0, text: "Ooh-ooh, some things you just can't refuse" },
  { time: 119.5, text: "She wanna ride me like a cruise and I'm not tryna lose" },
  { time: 125.8, text: "Then you're left in the dust, unless I stuck by ya" },
  { time: 132.8, text: "You're a sunflower, I think your love would be too much" },
  { time: 139.2, text: "Or you'll be left in the dust, unless I stuck by ya" },
  { time: 145.8, text: "You're the sunflower, you're the sunflower" }
];

// Shifting background gradients matching each page
const BG_GRADIENTS = [
  'linear-gradient(135deg, #2b0005 0%, #0d0002 100%)', // Page 1: Deep Crimson Letter
  'linear-gradient(135deg, #1b0a2a 0%, #08030d 100%)', // Page 2: Soft Purple Photo 1
  'linear-gradient(135deg, #2a1b05 0%, #0d0801 100%)', // Page 3: Warm Amber Photo 2
  'linear-gradient(135deg, #052618 0%, #010d08 100%)', // Page 4: Cozy Emerald Photo 3
  'linear-gradient(135deg, #2a2205 0%, #0d0a01 100%)', // Page 5: Sunset Bronze Photo 4
  'linear-gradient(135deg, #15052a 0%, #06010d 100%)', // Page 6: Evening Violet Photo 5
  'linear-gradient(135deg, #05142a 0%, #01060d 100%)'  // Page 7: Proposal Midnight Blue
];

export default function BirthdayView({ onBack }: BirthdayViewProps) {
  const [stage, setStage] = useState<Stage>('countdown');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [candlesLit, setCandlesLit] = useState([true, true, true]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isLidOff, setIsLidOff] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number; scale: number }>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [bookPage, setBookPage] = useState(0); // 0 to 6
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [proposalAnswer, setProposalAnswer] = useState('');
  const [isSendingProposal, setIsSendingProposal] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Check date lock or bypass via '?preview=true'
  useEffect(() => {
    const targetDate = new Date('2026-07-15T00:00:00');
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get('preview') === 'true';

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0 || isPreview) {
        setStage((prev) => (prev === 'countdown' ? 'cake' : prev));
      } else {
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

  // Generate Confetti particles
  const triggerConfetti = () => {
    const colors = ['#ffabf3', '#ffdada', '#ffb3b5', '#ffd700', '#ff69b4', '#800020'];
    const newConfetti = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      scale: 0.5 + Math.random() * 0.8,
    }));
    setConfetti(newConfetti);
  };

  // Microphone Blow Detection
  const startMicBlowDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkBlow = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        if (average > 65) {
          extinguishCandles();
        } else {
          animationFrameId.current = requestAnimationFrame(checkBlow);
        }
      };

      checkBlow();
    } catch (err) {
      setMicPermission(false);
    }
  };

  const stopMicBlowDetection = () => {
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const extinguishCandles = () => {
    setCandlesLit([false, false, false]);
    stopMicBlowDetection();
    triggerConfetti();
    setTimeout(() => {
      setStage('unwrap');
    }, 2000);
  };

  useEffect(() => {
    if (stage === 'cake') {
      startMicBlowDetection();
    }
    return () => stopMicBlowDetection();
  }, [stage]);

  // Audio Sync for Lyrics
  useEffect(() => {
    if (stage === 'letter' && bgMusicRef.current) {
      bgMusicRef.current.volume = 0.45;
      bgMusicRef.current.play().catch((err) => console.log('Autoplay blocked:', err));

      const handleTimeUpdate = () => {
        if (!bgMusicRef.current) return;
        const currentSeconds = bgMusicRef.current.currentTime;
        
        // Locate matching lyric index
        let matchingIndex = 0;
        for (let i = 0; i < SUNFLOWER_LYRICS.length; i++) {
          if (currentSeconds >= SUNFLOWER_LYRICS[i].time) {
            matchingIndex = i;
          } else {
            break;
          }
        }
        setCurrentLyricIndex(matchingIndex);

        // Center the active lyrics item in view
        if (lyricsContainerRef.current) {
          const activeEl = lyricsContainerRef.current.children[matchingIndex] as HTMLElement;
          if (activeEl) {
            lyricsContainerRef.current.scrollTo({
              top: activeEl.offsetTop - lyricsContainerRef.current.clientHeight / 2 + activeEl.clientHeight / 2,
              behavior: 'smooth'
            });
          }
        }
      };

      bgMusicRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        bgMusicRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [stage]);

  // Send Proposal Response via EmailJS
  const sendProposalAnswer = async () => {
    if (!proposalAnswer.trim()) return;
    setIsSendingProposal(true);

    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qrq0prl',
          template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_8dkkxv3',
          user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'MYp5r_0PhahPPXT3P',
          template_params: {
            name: 'Isha',
            email: 'proposal-answer@garden.app',
            message: `Proposal Answer:\n"${proposalAnswer}"`,
          },
        }),
      });
      setProposalSent(true);
    } catch (err) {
      console.error('Failed to send answer:', err);
    } finally {
      setIsSendingProposal(false);
    }
  };

  return (
    <div 
      style={{ background: stage === 'letter' ? BG_GRADIENTS[bookPage] : undefined }}
      className="min-h-screen w-full flex flex-col justify-start px-6 pb-26 relative overflow-y-auto select-none transition-all duration-1000 ease-in-out"
    >
      {/* Background audio for Letter stage */}
      {stage === 'letter' && (
        <audio ref={bgMusicRef} src={sunflowerMp3} loop />
      )}

      {/* Back Ribbon Tab */}
      <button
        onClick={() => {
          stopMicBlowDetection();
          onBack();
        }}
        className="fixed top-0 left-4 sm:left-8 z-50 bg-[#800020] text-[#ffdada] px-4 py-2 hover:py-2.5 rounded-b-xl shadow-xl flex flex-row items-center gap-2 transition-all cursor-pointer border-x border-b border-[#ffb3b5]/30 group active:scale-95"
      >
        <span className="text-xs group-hover:-translate-x-0.5 transition-transform">◀</span>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase">
          Garden
        </span>
      </button>

      {/* Primary Workspace */}
      <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-20 min-h-screen">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: COUNTDOWN */}
          {stage === 'countdown' && (
            <motion.div
              key="countdown-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="w-full flex flex-col items-center gap-8 text-center max-w-2xl"
            >
              <div>
                <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] animate-pulse">
                  A Secret Gift
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#e0bfbf] max-w-md mx-auto leading-relaxed">
                  A beautiful birthday surprise is preparing for you...
                </p>
              </div>

              {/* Vector SVG Gift Box */}
              <motion.div
                animate={{
                  y: [0, -16, 0],
                  rotate: [0, 1.5, -1.5, 0],
                }}
                transition={{
                  duration: 5,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
                className="w-48 h-48 flex items-center justify-center"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_20px_rgba(128,0,32,0.4)]">
                  {/* Glowing glow circle background */}
                  <circle cx="50" cy="50" r="45" fill="url(#pinkGlow)" className="animate-pulse" />
                  {/* Box bottom base */}
                  <rect x="25" y="45" width="50" height="40" rx="3" fill="#800020" />
                  {/* Box Lid */}
                  <rect x="21" y="36" width="58" height="10" rx="2" fill="#a41031" />
                  {/* Ribbon cross base */}
                  <rect x="47" y="45" width="6" height="40" fill="#ffd700" />
                  <rect x="47" y="36" width="6" height="10" fill="#ffd700" />
                  {/* Ribbon tie loop left */}
                  <path d="M 49 36 C 40 25, 30 25, 45 36 Z" fill="#ffd700" />
                  {/* Ribbon tie loop right */}
                  <path d="M 51 36 C 60 25, 70 25, 55 36 Z" fill="#ffd700" />
                  <defs>
                    <radialGradient id="pinkGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffabf3" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ffabf3" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Timer Grid */}
              <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md w-full px-2">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Mins', value: timeLeft.minutes },
                  { label: 'Secs', value: timeLeft.seconds },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="glass-card-custom rounded-2xl py-4 flex flex-col items-center justify-center border border-[#ffb3b5]/15 shadow-xl bg-[#121414]/40"
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

              <div className="w-full glass-card-custom rounded-3xl p-6 sm:p-8 border border-[#ffb3b5]/10 max-w-lg shadow-2xl">
                <p className="font-handwriting text-2xl sm:text-3xl text-white/90 leading-relaxed italic">
                  "Patience, princess! No peeking until the clock strikes midnight on July 15th. 🤫✨"
                </p>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: THE BIRTHDAY CAKE */}
          {stage === 'cake' && (
            <motion.div
              key="cake-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center text-center gap-6 max-w-2xl"
            >
              <div>
                <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  Make a Wish! 🎂
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#ffdada]/70 max-w-md mx-auto">
                  {micPermission
                    ? 'Blow directly into your phone’s microphone to put out the candles!'
                    : 'Tap the candles to blow them out!'}
                </p>
              </div>

              {/* Vector SVG Birthday Cake */}
              <div className="relative w-72 h-72 flex flex-col items-center justify-end pb-8">
                {/* SVG Illustration Container */}
                <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 z-10 pointer-events-none">
                  {/* Stand plate */}
                  <ellipse cx="100" cy="170" rx="80" ry="12" fill="#4a525d" opacity="0.3" />
                  <path d="M 40 170 C 40 180, 160 180, 160 170 Z" fill="#ffdada" opacity="0.2" />

                  {/* Tier 1 (Bottom Cake Layer) */}
                  <rect x="40" y="105" width="120" height="60" rx="8" fill="#800020" />
                  {/* Tier 1 Frosting ripples */}
                  <path d="M 40 115 Q 50 125 60 115 Q 70 125 80 115 Q 90 125 100 115 Q 110 125 120 115 Q 130 125 140 115 Q 150 125 160 115" fill="none" stroke="#ffabf3" strokeWidth="4" />

                  {/* Tier 2 (Top Cake Layer) */}
                  <rect x="55" y="60" width="90" height="50" rx="6" fill="#a41031" />
                  {/* Tier 2 Frosting drips */}
                  <path d="M 55 70 C 65 80, 75 65, 85 75 C 95 65, 105 80, 115 70 C 125 80, 135 65, 145 70" fill="none" stroke="#ffdada" strokeWidth="3" />

                  {/* Isha text overlay */}
                  <text x="100" y="145" fill="#ffdada" fontSize="18" fontFamily="Georgia, serif" fontStyle="italic" textAnchor="middle" fontWeight="bold">Isha</text>
                </svg>

                {/* Actual interactive Candle triggers overlay */}
                <div className="flex gap-10 mb-[105px] z-20">
                  {candlesLit.map((lit, i) => (
                    <div 
                      key={i} 
                      className="relative w-4 h-16 bg-gradient-to-t from-pink-500 via-[#ffdada] to-white rounded-t-sm shadow-md cursor-pointer hover:scale-105 transition-transform" 
                      onClick={extinguishCandles}
                    >
                      {/* Animated flame */}
                      {lit && (
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 0.9, 1.1, 1],
                            y: [0, -3, 1, -2, 0],
                            rotate: [0, 5, -5, 3, 0]
                          }}
                          transition={{ duration: 1 + Math.random() * 0.5, repeat: Infinity }}
                          className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-5 h-7 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 rounded-full shadow-[0_0_15px_#ff7b00] origin-bottom"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: THE GIFT UNWRAPPING */}
          {stage === 'unwrap' && (
            <motion.div
              key="unwrap-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center text-center gap-8 max-w-2xl"
            >
              {/* Confetti Rendering */}
              <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {confetti.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ y: -50, x: `${c.x}vw`, rotate: 0, opacity: 1 }}
                    animate={{
                      y: '105vh',
                      rotate: 360,
                      opacity: 0.2,
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      delay: c.delay,
                      ease: 'linear',
                    }}
                    style={{
                      position: 'absolute',
                      width: '10px',
                      height: '10px',
                      backgroundColor: c.color,
                      borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                      transform: `scale(${c.scale})`,
                    }}
                  />
                ))}
              </div>

              <div>
                <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                  Your Gift is Ready!
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#ffdada]/70">
                  Tap the glowing gift box to unwrap it
                </p>
              </div>

              {/* Interactive Vector SVG Unwrapping Action */}
              <div 
                className="relative w-64 h-64 flex items-center justify-center cursor-pointer group" 
                onClick={() => {
                  setIsLidOff(true);
                  setTimeout(() => {
                    setStage('letter');
                  }, 1600);
                }}
              >
                <div className="w-full h-full absolute inset-0 z-10 pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Box base bottom */}
                    <rect x="25" y="45" width="50" height="40" rx="3" fill="#800020" className="filter drop-shadow-xl" />
                    <rect x="47" y="45" width="6" height="40" fill="#ffd700" />

                    {/* Shifting lid */}
                    <motion.g
                      animate={isLidOff ? { y: -60, rotate: 18, opacity: 0 } : { y: [0, -4, 0] }}
                      transition={isLidOff ? { duration: 1.2, ease: 'easeOut' } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <rect x="21" y="36" width="58" height="10" rx="2" fill="#a41031" />
                      <rect x="47" y="36" width="6" height="10" fill="#ffd700" />
                      <path d="M 49 36 C 40 25, 30 25, 45 36 Z" fill="#ffd700" />
                      <path d="M 51 36 C 60 25, 70 25, 55 36 Z" fill="#ffd700" />
                    </motion.g>
                  </svg>
                </div>

                {/* Explosion sparkles */}
                {isLidOff && (
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1.3, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5 }}
                    className="absolute text-7xl text-[#ffabf3] select-none pointer-events-none z-20"
                  >
                    ✨💖✨
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE 4: DYNAMIC Synced Lyrics (Left) & 7-Page Book (Right) */}
          {stage === 'letter' && (
            <motion.div
              key="letter-stage"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* Header bar controls */}
              <div className="w-full flex justify-between items-center px-2">
                <div className="text-xs uppercase tracking-widest text-[#ffdada]/60 font-sans">
                  Page {bookPage + 1} of 7
                </div>

                <button
                  onClick={() => {
                    if (bgMusicRef.current) {
                      bgMusicRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass-card-custom border border-[#ffb3b5]/20 text-xs text-[#ffb3b5] hover:bg-[#800020]/25 transition-all active:scale-95 cursor-pointer"
                >
                  {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{isMuted ? 'Muted' : 'Sunflower playing 🌻'}</span>
                </button>
              </div>

              {/* Layout splits into Lyrics (Left) and Book (Right) */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                
                {/* LEFT SIDE: Apple/Spotify-style Synced Lyrics Panel */}
                <div className="glass-card-custom rounded-3xl p-6 sm:p-8 border border-[#ffb3b5]/15 bg-black/45 backdrop-blur-xl shadow-2xl flex flex-col h-[65vh] relative overflow-hidden select-none">
                  {/* Lyrics scroll body */}
                  <div 
                    ref={lyricsContainerRef}
                    className="flex-1 overflow-y-auto pr-2 space-y-6 flex flex-col scrollbar-none relative py-[20vh]"
                  >
                    {SUNFLOWER_LYRICS.map((line, idx) => {
                      const isActive = idx === currentLyricIndex;
                      const isPast = idx < currentLyricIndex;
                      
                      return (
                        <motion.div
                          key={idx}
                          animate={{
                            opacity: isActive ? 1.0 : isPast ? 0.45 : 0.2,
                            scale: isActive ? 1.02 : 1.0,
                            textShadow: isActive ? '0 0 16px rgba(255,255,255,0.7)' : 'none',
                          }}
                          transition={{ duration: 0.4 }}
                          className={`text-lg sm:text-xl font-bold font-sans tracking-wide transition-colors leading-relaxed cursor-pointer ${
                            isActive ? 'text-white' : 'text-white/60'
                          }`}
                          onClick={() => {
                            if (bgMusicRef.current) {
                              bgMusicRef.current.currentTime = line.time;
                              setCurrentLyricIndex(idx);
                            }
                          }}
                        >
                          {line.text}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT SIDE: Interactive Page-Turning Book */}
                <div className="glass-card-custom rounded-3xl p-8 sm:p-10 border border-[#ffb3b5]/15 bg-[#121414]/75 shadow-2xl flex flex-col h-[65vh] justify-between relative overflow-hidden">
                  
                  {/* Page transition stage */}
                  <div className="flex-1 overflow-y-auto pr-1 scrollbar-custom">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={bookPage}
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.4 }}
                        className="h-full flex flex-col"
                      >
                        
                        {/* PAGE 1: THE LETTER */}
                        {bookPage === 0 && (
                          <div className="flex flex-col gap-5 text-[#ffdada]/95">
                            <h3 className="font-serif italic text-3xl text-[#ffb3b5] border-b border-[#ffb3b5]/20 pb-3">
                              Happy Birthday, My Princess 🌹
                            </h3>
                            <p className="font-handwriting text-2.5xl leading-loose">
                              Dearest Isha,
                            </p>
                            <p className="font-handwriting text-2.5xl leading-loose">
                              Happy birthday to the most beautiful, loving, and amazing person in my world. From the moment you entered my life, you turned every simple corner of it into a magical sanctuary. Even in moments of distance, you are the whisper in the wind that brings me warmth.
                            </p>
                            <p className="font-handwriting text-2.5xl leading-loose">
                              I built this secret garden just for you—a small space to remind you of how cherished, loved, and valued you are, every single second of the day. May this year bring you all the warmth, laughter, and stars that you deserve.
                            </p>
                            <p className="font-handwriting text-2.5xl leading-loose text-right mt-6 italic">
                              Forever and always yours, ❤️
                            </p>
                          </div>
                        )}

                        {/* PHOTO PAGE 2 */}
                        {bookPage === 1 && (
                          <div className="flex flex-col items-center justify-center gap-6 h-full py-4">
                            <div className="w-full max-h-[38vh] rounded-2xl overflow-hidden border border-[#ffb3b5]/20 shadow-xl bg-black/20">
                              <img src={photo1} alt="Memory 1" className="w-full h-full object-contain object-center rounded-2xl select-none pointer-events-none max-h-[38vh]" />
                            </div>
                            <p className="font-handwriting text-2.5xl text-[#ffdadb] italic text-center mt-2">
                              "Looking back at one of my favorite moments of you..."
                            </p>
                          </div>
                        )}

                        {/* PHOTO PAGE 3 */}
                        {bookPage === 2 && (
                          <div className="flex flex-col items-center justify-center gap-6 h-full py-4">
                            <div className="w-full max-h-[38vh] rounded-2xl overflow-hidden border border-[#ffb3b5]/20 shadow-xl bg-black/20">
                              <img src={photo2} alt="Memory 2" className="w-full h-full object-contain object-center rounded-2xl select-none pointer-events-none max-h-[38vh]" />
                            </div>
                            <p className="font-handwriting text-2.5xl text-[#ffdadb] italic text-center mt-2">
                              "Every smile of yours prints a permanent light in my heart."
                            </p>
                          </div>
                        )}

                        {/* PHOTO PAGE 4 */}
                        {bookPage === 3 && (
                          <div className="flex flex-col items-center justify-center gap-6 h-full py-4">
                            <div className="w-full max-h-[38vh] rounded-2xl overflow-hidden border border-[#ffb3b5]/20 shadow-xl bg-black/20">
                              <img src={photo3} alt="Memory 3" className="w-full h-full object-contain object-center rounded-2xl select-none pointer-events-none max-h-[38vh]" />
                            </div>
                            <p className="font-handwriting text-2.5xl text-[#ffdadb] italic text-center mt-2">
                              "Even in quiet spaces, your memory keeps me complete."
                            </p>
                          </div>
                        )}

                        {/* PHOTO PAGE 5 */}
                        {bookPage === 4 && (
                          <div className="flex flex-col items-center justify-center gap-6 h-full py-4">
                            <div className="w-full max-h-[38vh] rounded-2xl overflow-hidden border border-[#ffb3b5]/20 shadow-xl bg-black/20">
                              <img src={photo4} alt="Memory 4" className="w-full h-full object-contain object-center rounded-2xl select-none pointer-events-none max-h-[38vh]" />
                            </div>
                            <p className="font-handwriting text-2.5xl text-[#ffdadb] italic text-center mt-2">
                              "You are my shelter, my peaceful sky, and my anchor."
                            </p>
                          </div>
                        )}

                        {/* PHOTO PAGE 6 */}
                        {bookPage === 5 && (
                          <div className="flex flex-col items-center justify-center gap-6 h-full py-4">
                            <div className="w-full max-h-[38vh] rounded-2xl overflow-hidden border border-[#ffb3b5]/20 shadow-xl bg-black/20">
                              <img src={photo5} alt="Memory 5" className="w-full h-full object-contain object-center rounded-2xl select-none pointer-events-none max-h-[38vh]" />
                            </div>
                            <p className="font-handwriting text-2.5xl text-[#ffdadb] italic text-center mt-2">
                              "Thank you for being you, for every single second."
                            </p>
                          </div>
                        )}

                        {/* PAGE 7: THE PROPOSAL & EMAILJS RESPONSE */}
                        {bookPage === 6 && (
                          <div className="flex flex-col justify-center h-full gap-5 text-center py-4">
                            {!proposalSent ? (
                              <>
                                <h3 className="font-serif italic text-3.5xl text-[#ffb3b5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                  Will this birthday girl be my Forever?
                                </h3>
                                <h4 className="font-serif italic text-4xl text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.35)] animate-pulse">
                                  My Wife? 💍
                                </h4>

                                <div className="mt-4 flex flex-col gap-4">
                                  <textarea
                                    value={proposalAnswer}
                                    onChange={(e) => setProposalAnswer(e.target.value)}
                                    disabled={isSendingProposal}
                                    placeholder="Write your answer to my heart here..."
                                    className="w-full h-28 bg-[#121414]/50 border border-[#ffb3b5]/25 rounded-2xl p-4 focus:ring-1 focus:ring-[#ffabf3]/50 focus:outline-none text-[#ffdada] font-handwriting text-xl sm:text-2xl resize-none"
                                  />
                                  
                                  <button
                                    onClick={sendProposalAnswer}
                                    disabled={!proposalAnswer.trim() || isSendingProposal}
                                    className="w-full bg-gradient-to-r from-[#800020] to-[#a41031] text-[#ffdada] hover:scale-102 active:scale-98 transition-all font-semibold uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-default"
                                  >
                                    <span>{isSendingProposal ? 'Sending Response...' : 'Send My Answer'}</span>
                                    <Send size={12} />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-4 text-center"
                              >
                                <span className="text-6xl filter drop-shadow-lg animate-bounce">💖</span>
                                <h3 className="font-serif italic text-3xl text-[#ffb3b5]">Answer Dispatched</h3>
                                <p className="font-handwriting text-2.5xl text-white/90 leading-relaxed max-w-sm">
                                  "Your response took flight and has been securely sent directly to my inbox. I love you."
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}

                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Page-turn Controls */}
                  <div className="flex justify-between items-center border-t border-[#ffb3b5]/15 pt-5 mt-4">
                    <button
                      onClick={() => setBookPage((prev) => Math.max(0, prev - 1))}
                      disabled={bookPage === 0}
                      className="p-2 rounded-full border border-[#ffb3b5]/15 text-[#ffb3b5] hover:bg-[#800020]/25 transition-all disabled:opacity-30 disabled:cursor-default cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    <span className="text-[11px] font-semibold text-[#ffdada]/60 font-sans tracking-wide">
                      {bookPage === 0 ? 'Start reading 📖' : bookPage === 6 ? 'The final step 💍' : 'Slide for more Memories'}
                    </span>

                    <button
                      onClick={() => setBookPage((prev) => Math.min(6, prev + 1))}
                      disabled={bookPage === 6}
                      className="p-2 rounded-full border border-[#ffb3b5]/15 text-[#ffb3b5] hover:bg-[#800020]/25 transition-all disabled:opacity-30 disabled:cursor-default cursor-pointer"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
