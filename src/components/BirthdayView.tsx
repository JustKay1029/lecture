import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import thinkingOfYouMp3 from '../assets/Thinking Of You - AP Dhillon.mp3';

interface BirthdayViewProps {
  onBack: () => void;
}

type Stage = 'countdown' | 'cake' | 'unwrap' | 'letter';

export default function BirthdayView({ onBack }: BirthdayViewProps) {
  const [stage, setStage] = useState<Stage>('countdown');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [candlesLit, setCandlesLit] = useState([true, true, true]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isLidOff, setIsLidOff] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number; scale: number }>>([]);
  const [isMuted, setIsMuted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Check date lock or bypass via '?preview=true'
  useEffect(() => {
    const targetDate = new Date('2026-07-15T00:00:00');
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get('preview') === 'true';

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0 || isPreview) {
        // If it is birthday or preview, transition directly to the cake stage if currently in countdown
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
      x: Math.random() * 100, // percentage x-axis
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

        // Find average amplitude
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // If the average sound level crosses threshold, blow out candles
        if (average > 65) {
          extinguishCandles();
        } else {
          animationFrameId.current = requestAnimationFrame(checkBlow);
        }
      };

      checkBlow();
    } catch (err) {
      console.warn('Microphone access denied or unsupported, fallback to click.', err);
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
    // Transition to unwrap stage after 2 seconds
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

  // Sound chimes and music controllers
  useEffect(() => {
    if (stage === 'letter' && bgMusicRef.current) {
      bgMusicRef.current.volume = 0.45;
      bgMusicRef.current.play().catch((err) => console.log('Audio autoplay blocked by browser:', err));
    }
  }, [stage]);

  return (
    <div className="min-h-screen w-full flex flex-col justify-start px-6 pb-26 relative overflow-y-auto select-none">
      {/* Background audio for Letter stage */}
      {stage === 'letter' && (
        <audio ref={bgMusicRef} src={thinkingOfYouMp3} loop />
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
      <main className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-20 min-h-screen">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: COUNTDOWN */}
          {stage === 'countdown' && (
            <motion.div
              key="countdown-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="w-full flex flex-col items-center gap-8 text-center"
            >
              <div>
                <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] animate-pulse">
                  A Secret Gift
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#e0bfbf] max-w-md mx-auto leading-relaxed">
                  A beautiful birthday surprise is preparing for you...
                </p>
              </div>

              {/* Glowing Floating Gift Box Container */}
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
                className="relative w-44 h-44 flex items-center justify-center bg-gradient-to-tr from-[#800020]/20 to-[#ffabf3]/10 rounded-full border border-[#ffb3b5]/25 shadow-[0_0_50px_rgba(255,171,243,0.15)]"
              >
                <div className="absolute inset-2 rounded-full border border-dashed border-[#ffabf3]/30 animate-spin-slow" />
                <div className="text-6xl filter drop-shadow-[0_4px_12px_rgba(128,0,32,0.6)]">
                  🎁
                </div>
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
              className="w-full flex flex-col items-center text-center gap-6"
            >
              <div>
                <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-2">
                  Make a Wish! 🎂
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#ffdada]/70 max-w-md mx-auto">
                  {micPermission
                    ? 'Blow directly into your phone’s microphone to put out the candles!'
                    : 'Tap the candles to blow them out!'}
                </p>
              </div>

              {/* 2D Vector Styled Cake */}
              <div className="relative w-64 h-64 flex flex-col items-center justify-end pb-8">
                {/* Candle holders */}
                <div className="flex gap-8 mb-[-4px] z-20">
                  {candlesLit.map((lit, i) => (
                    <div key={i} className="relative w-3.5 h-16 bg-gradient-to-t from-pink-500 to-[#ffdada] rounded-t-sm shadow-md cursor-pointer" onClick={extinguishCandles}>
                      {lit && (
                        <motion.div
                          animate={{
                            scale: [1, 1.15, 0.95, 1],
                            y: [0, -2, 1, 0],
                            opacity: [0.95, 1, 0.9, 0.95],
                          }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 rounded-full shadow-[0_0_12px_#ff7b00] origin-bottom"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Cake Top Layer */}
                <div className="w-48 h-16 bg-[#ffabf3] rounded-t-3xl border-b-4 border-pink-600/30 shadow-lg relative flex justify-around items-start pt-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-md animate-bounce" />
                  <div className="w-4 h-4 rounded-full bg-amber-400 shadow-md animate-bounce delay-100" />
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-md animate-bounce delay-200" />
                </div>

                {/* Cake Bottom Layer */}
                <div className="w-56 h-20 bg-[#800020]/90 rounded-b-xl shadow-2xl relative flex flex-col justify-center items-center">
                  <div className="absolute top-0 left-0 w-full h-3 bg-pink-300 opacity-40 rounded-b-md" />
                  <span className="font-handwriting text-2xl text-[#ffdada]/90 mt-2 font-semibold">Isha</span>
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
              className="w-full flex flex-col items-center text-center gap-8"
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
                  Tap the glowing gift box to open it
                </p>
              </div>

              {/* Gift unwrapping target */}
              <div className="relative w-64 h-64 flex items-center justify-center cursor-pointer" onClick={() => {
                setIsLidOff(true);
                setTimeout(() => {
                  setStage('letter');
                }, 1600);
              }}>
                <motion.div
                  animate={isLidOff ? { y: -150, rotate: 15, opacity: 0 } : { y: [0, -10, 0] }}
                  transition={isLidOff ? { duration: 1.2, ease: 'easeOut' } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute z-30 text-8xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                >
                  🎁
                </motion.div>
                {isLidOff && (
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5 }}
                    className="absolute text-7xl text-[#ffabf3] select-none pointer-events-none"
                  >
                    ✨💖✨
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE 4: THE LOVE LETTER */}
          {stage === 'letter' && (
            <motion.div
              key="letter-stage"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* Music controls */}
              <div className="w-full flex justify-end">
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
                  <span>{isMuted ? 'Muted' : 'Playing Background Music'}</span>
                </button>
              </div>

              {/* Love Letter Card */}
              <div className="w-full glass-card-custom rounded-3xl p-6 sm:p-10 border border-[#ffb3b5]/20 bg-[#121414]/65 shadow-2xl relative max-h-[70vh] overflow-y-auto font-sans leading-relaxed text-[#ffdada]/95 flex flex-col gap-6 scrollbar-custom">
                {/* Decorative header */}
                <div className="text-center border-b border-[#ffb3b5]/15 pb-4">
                  <span className="text-[#ffabf3] text-2xl">🌹</span>
                  <h3 className="font-serif italic text-3xl text-[#ffb3b5] mt-2">Happy Birthday, My Princess</h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#ffdada]/60 font-sans block mt-1">July 15, 2026</span>
                </div>

                {/* Letter Body */}
                <p className="font-handwriting text-2xl leading-loose">
                  Dearest Isha,
                </p>
                <p className="font-handwriting text-2.5xl leading-loose">
                  Happy birthday to the most beautiful, loving, and amazing person in my world. From the moment you entered my life, you turned every simple corner of it into a magical sanctuary. Even in moments of distance, you are the whisper in the wind that brings me warmth, and the brightness in every morning.
                </p>
                <p className="font-handwriting text-2.5xl leading-loose">
                  I built this secret garden just for you—a small space to remind you of how cherished, loved, and valued you are, every single second of the day. May this year bring you all the warmth, laughter, and stars that you deserve.
                </p>
                <p className="font-handwriting text-2.5xl leading-loose">
                  I promise to always be here, to celebrate your happiest days, and to hold your hand through the stormy ones.
                </p>
                <p className="font-handwriting text-2.5xl leading-loose text-right mt-6 italic">
                  Forever and always yours, ❤️
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
