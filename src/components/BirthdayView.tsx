import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Send } from 'lucide-react';
import { ReadingTextReveal } from './ui/reading-text-reveal';
import { VaporTextEffect } from './ui/vapor-text-effect';
import { BalloonBirthdayScene } from './ui/balloon-birthday-scene';

import valleysMp3 from '../assets/WOAH_-_Valleys_(mp3.pm).mp3';

// Import the 8 memory photos for customizable slots
import photo1 from '../assets/WhatsApp Image 2026-05-25 at 20.06.30 (1).jpeg';
import photo2 from '../assets/WhatsApp Image 2026-05-25 at 20.06.31.jpeg';
import photo3 from '../assets/WhatsApp Image 2026-05-25 at 20.06.34.jpeg';
import photo4 from '../assets/WhatsApp Image 2026-05-25 at 20.06.37.jpeg';
import photo5 from '../assets/WhatsApp Image 2026-05-25 at 20.06.39.jpeg';
import photo6 from '../assets/IMG-20260609-WA0092.jpg';
import photo7 from '../assets/IMG-20260609-WA0093.jpg';
import photo8 from '../assets/IMG-20260609-WA0094.jpg';

interface BirthdayViewProps {
  onBack: () => void;
}

type Stage = 'countdown' | 'cake' | 'unwrap' | 'vapor' | 'balloon-scene' | 'letter';

const STORY_SEGMENTS = [
  "Dearest Isha, Happy birthday to the most beautiful, loving, and amazing person in my world.",
  "From the moment you entered my life, you turned every simple corner of it into a magical sanctuary. Even in moments of distance, you are the whisper in the wind that brings me warmth.",
  "I built this secret garden just for you—a small space to remind you of how cherished, loved, and valued you are, every single second of the day. May this year bring you all the warmth, laughter, and stars that you deserve.",
  "I promise to always be here, to celebrate your happiest days, and to hold your hand through the stormy ones.",
  "Forever and always yours, ❤️"
];

// EASY-TO-EDIT Photo Configuration list for background floating images.
// You can edit, add, or sequence as many photos as you want!
const MEMORY_PHOTOS = [
  { id: 1, url: photo1, shape: 'circle', x: '10%', y: 800, size: 100 },
  { id: 2, url: photo2, shape: 'heart', x: '75%', y: 1300, size: 110 },
  { id: 3, url: photo3, shape: 'rounded', x: '12%', y: 1900, size: 115 },
  { id: 4, url: photo4, shape: 'circle', x: '78%', y: 2500, size: 100 },
  { id: 5, url: photo5, shape: 'rounded', x: '8%', y: 3100, size: 110 },
  { id: 6, url: photo6, shape: 'heart', x: '72%', y: 3700, size: 105 },
  { id: 7, url: photo7, shape: 'circle', x: '15%', y: 4300, size: 95 },
  { id: 8, url: photo8, shape: 'rounded', x: '76%', y: 4900, size: 120 }
];

export default function BirthdayView({ onBack }: BirthdayViewProps) {
  const [stage, setStage] = useState<Stage>('countdown');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [candlesLit, setCandlesLit] = useState([true, true, true]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isLidOff, setIsLidOff] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number; scale: number }>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [proposalAnswer, setProposalAnswer] = useState('');
  const [isSendingProposal, setIsSendingProposal] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);

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

  // Sync scroll position
  useEffect(() => {
    if (stage === 'letter') {
      const handleScroll = () => {
        setScrollY(window.scrollY);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [stage]);

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

    // Start playing background music immediately when candles are blown out!
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.45;
      bgMusicRef.current.play().catch((err) => console.log('Audio autoplay blocked:', err));
    }

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

  // Get current scroll-based background color style
  // Starts true black at the top, fades to warm lovely cream/peach in the middle/proposal sections.
  const getBackgroundStyle = () => {
    if (stage !== 'letter') return '#000000';
    // Smooth transition to dark ambient purple
    if (scrollY > 1200) {
      return 'linear-gradient(135deg, #11071d 0%, #04010a 100%)';
    }
    return '#000000';
  };

  return (
    <div 
      style={{ background: getBackgroundStyle() }}
      className="min-h-screen w-full flex flex-col justify-start px-4 pb-20 relative overflow-y-auto select-none transition-all duration-1000 ease-in-out scroll-smooth"
    >
      {/* Background audio tag */}
      <audio ref={bgMusicRef} src={valleysMp3} loop />

      {/* Back Ribbon Tab */}
      <button
        onClick={() => {
          stopMicBlowDetection();
          onBack();
        }}
        className="fixed top-0 left-4 z-50 bg-[#800020] text-[#ffdada] px-4 py-2 hover:py-2.5 rounded-b-xl shadow-xl flex flex-row items-center gap-2 transition-all cursor-pointer border-x border-b border-[#ffb3b5]/30 group active:scale-95"
      >
        <span className="text-xs group-hover:-translate-x-0.5 transition-transform">◀</span>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase">
          Garden
        </span>
      </button>

      {/* Primary Workspace */}
      <main className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: COUNTDOWN */}
          {stage === 'countdown' && (
            <motion.div
              key="countdown-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="w-full flex flex-col items-center gap-8 text-center py-20"
            >
              <div>
                <h2 className="font-serif italic text-4xl text-[#ffb3b5] mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] animate-pulse">
                  A Secret Gift
                </h2>
                <p className="font-sans text-xs text-[#e0bfbf] max-w-md mx-auto leading-relaxed">
                  A beautiful birthday surprise is preparing for you...
                </p>
              </div>

              {/* Minimal Clean CSS Gift Box */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
                className="relative w-32 h-32 flex items-center justify-center animate-pulse"
              >
                <div className="w-24 h-24 bg-[#800020] rounded-xl shadow-2xl relative border border-white/5 flex items-center justify-center">
                  <div className="absolute inset-y-0 w-3 bg-[#ffd700]" />
                  <div className="absolute inset-x-0 h-3 bg-[#ffd700]" />
                  <div className="absolute -top-2.5 w-6 h-6 rounded-full border-4 border-[#ffd700] bg-transparent" />
                </div>
              </motion.div>

              {/* Timer Grid */}
              <div className="grid grid-cols-4 gap-2.5 w-full px-2">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Mins', value: timeLeft.minutes },
                  { label: 'Secs', value: timeLeft.seconds },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="glass-card-custom rounded-2xl py-3 flex flex-col items-center justify-center border border-[#ffb3b5]/15 shadow-xl bg-[#121414]/40"
                  >
                    <span className="font-serif text-2xl text-[#ffdada] font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-[#ffb3b5] uppercase tracking-wider mt-1 font-sans">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full glass-card-custom rounded-3xl p-6 border border-[#ffb3b5]/10 shadow-2xl">
                <p className="font-handwriting text-2xl text-white/90 leading-relaxed italic">
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
              className="w-full flex flex-col items-center text-center gap-6 py-20"
            >
              <div>
                <h2 className="font-serif italic text-4xl text-[#ffb3b5] mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  Make a Wish! 🎂
                </h2>
                <p className="font-sans text-xs text-[#ffdada]/70 max-w-md mx-auto">
                  {micPermission
                    ? 'Blow directly into your phone’s microphone to put out the candles!'
                    : 'Tap the candles to blow them out!'}
                </p>
              </div>

              {/* Minimal Clean CSS Cake */}
              <div className="relative w-64 h-64 flex flex-col items-center justify-end pb-4">
                <div className="w-48 h-2 bg-white/10 rounded-full shadow-md mb-1" />
                <div className="w-36 h-20 bg-gradient-to-t from-[#800020] to-[#b31942] rounded-t-2xl relative border-t border-white/10 shadow-xl flex justify-center items-start pt-4">
                  <div className="absolute top-8 left-0 right-0 h-0.5 bg-[#ffdada]/20" />
                  
                  {/* Candle holders */}
                  <div className="flex gap-6 -mt-8 z-20">
                    {candlesLit.map((lit, i) => (
                      <div 
                        key={i} 
                        className="relative w-2.5 h-8 bg-gradient-to-t from-pink-500 to-white rounded-t-sm shadow-sm cursor-pointer"
                        onClick={extinguishCandles}
                      >
                        {lit && (
                          <motion.div
                            animate={{
                              scale: [1, 1.15, 0.95, 1],
                              opacity: [0.9, 1, 0.85, 0.9],
                            }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-3.5 h-4.5 bg-gradient-to-t from-orange-500 via-yellow-400 to-white rounded-full shadow-[0_0_8px_#ff7b00]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
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
              className="w-full flex flex-col items-center text-center gap-8 py-20"
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
                <h2 className="font-serif italic text-4xl text-[#ffb3b5] mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                  Your Gift is Ready!
                </h2>
                <p className="font-sans text-xs text-[#ffdada]/70">
                  Tap the glowing gift box to unwrap it
                </p>
              </div>

              {/* Minimal CSS Gift Box */}
              <div 
                className="relative w-64 h-64 flex items-center justify-center cursor-pointer group" 
                onClick={() => {
                  setIsLidOff(true);
                  setTimeout(() => {
                    setStage('vapor');
                  }, 1600);
                }}
              >
                <motion.div
                  animate={isLidOff ? { y: -150, opacity: 0, scale: 0.8 } : { y: [0, -10, 0] }}
                  transition={isLidOff ? { duration: 1.2, ease: 'easeOut' } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-28 h-28 bg-[#800020] rounded-xl shadow-2xl relative border border-white/5 flex items-center justify-center"
                >
                  <div className="absolute inset-y-0 w-2.5 bg-[#ffd700]" />
                  <div className="absolute inset-x-0 h-2.5 bg-[#ffd700]" />
                  <div className="absolute -top-2.5 w-6 h-6 rounded-full border-4 border-[#ffd700] bg-transparent" />
                </motion.div>

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

          {/* STAGE 3.5: VAPOR TEXT EFFECT */}
          {stage === 'vapor' && (
            <VaporTextEffect onComplete={() => setStage('balloon-scene')} />
          )}

          {/* STAGE 3.8: BALLOON BIRTHDAY SCENE */}
          {stage === 'balloon-scene' && (
            <BalloonBirthdayScene onComplete={() => setStage('letter')} />
          )}

          {/* STAGE 4: ONE PAGE VERTICALLY SCROLLABLE PRESENTATION */}
          {stage === 'letter' && (
            <motion.div
              key="letter-stage"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-24 py-10 relative"
            >
              {/* Dynamic Shifting Ambient Photos floating upwards behind text */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden min-h-[400vh]">
                {MEMORY_PHOTOS.map((photo) => {
                  // Determine read vs unread state based on scroll coordinates
                  const isRead = scrollY > photo.y - 280;
                  
                  return (
                    <motion.div
                      key={photo.id}
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 1.5, -1.5, 0],
                      }}
                      transition={{
                        duration: 5 + (photo.id % 3) * 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      style={{
                        position: 'absolute',
                        left: photo.x,
                        top: `${photo.y}px`,
                        width: `${photo.size}px`,
                        height: `${photo.size}px`,
                        transition: 'filter 0.8s ease-out, opacity 0.8s ease-out',
                        filter: isRead ? 'blur(4px)' : 'none',
                        opacity: isRead ? 0.08 : 0.28,
                      }}
                    >
                      {/* CSS Heart masking support */}
                      <div 
                        className={`w-full h-full border border-white/10 overflow-hidden shadow-2xl bg-black/10 backdrop-blur-sm ${
                          photo.shape === 'circle' ? 'rounded-full' :
                          photo.shape === 'rounded' ? 'rounded-2xl' : ''
                        }`}
                        style={{
                          clipPath: photo.shape === 'heart' ? 'url(#heart-clip)' : undefined
                        }}
                      >
                        <img src={photo.url} alt="Memory item" className="w-full h-full object-cover select-none" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Sticky Sound Volume Controller */}
              <div className="sticky top-4 z-40 flex justify-between items-center w-full pointer-events-auto">
                <span className="text-[10px] tracking-widest font-sans uppercase font-bold text-[#ffb3b5] bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                  Happy Birthday, Isha
                </span>
                
                <button
                  onClick={() => {
                    if (bgMusicRef.current) {
                      bgMusicRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs text-[#ffb3b5] active:scale-95 cursor-pointer bg-black/60 shadow-lg"
                >
                  {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{isMuted ? 'Muted' : 'Music playing 🌻'}</span>
                </button>
              </div>

              {/* SECTION 1: THE LOVE LETTER TEXT REVEAL */}
              <div
                className="w-full min-h-[120vh] flex flex-col justify-center py-20 relative z-10"
              >
                <div className="text-center mb-16">
                  <h3 className="font-serif italic text-3xl sm:text-4xl text-[#ffb3b5] drop-shadow-md">
                    To My Safe Place 🌹
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-[#ffdada]/60 font-sans mt-2">
                    Scroll down slowly to read...
                  </p>
                </div>

                <ReadingTextReveal storySegments={STORY_SEGMENTS} />
              </div>

              {/* SECTION 2: TRANSITION & FLOATING MEMORY LANE INTRO */}
              <div className="min-h-[60vh] flex flex-col justify-center text-center px-4 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="max-w-md mx-auto"
                >
                  <h3 className="font-serif italic text-3xl text-[#ffb3b5] mb-4">Our Safe Haven</h3>
                  <p className="font-sans text-sm text-[#ffdada]/80 leading-relaxed">
                    A place so far away, where you are by my side, stress-free. Every memory floated above is a promise of the beautiful days waiting for us ahead. Let the stress melt away, my princess. ❤️
                  </p>
                </motion.div>
              </div>

              {/* SECTION 3: THE PROPOSAL & MESSAGE SENDER */}
              <div className="w-full flex flex-col justify-center min-h-[70vh] text-center px-4 relative z-10">
                {!proposalSent ? (
                  <div 
                    className="flex flex-col gap-5 py-6 max-w-md mx-auto w-full rounded-3xl p-6 sm:p-8 bg-black/45 border border-white/5 shadow-2xl"
                  >
                    <h3 
                      className="font-serif italic text-3xl sm:text-4xl text-[#ffb3b5]"
                    >
                      Will this birthday girl be my Forever?
                    </h3>
                    <h4 className="font-serif italic text-4xl sm:text-5.5xl text-[#ffd700] animate-pulse drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                      My Wife? 💍
                    </h4>

                    <div className="mt-4 flex flex-col gap-4">
                      <textarea
                        value={proposalAnswer}
                        onChange={(e) => setProposalAnswer(e.target.value)}
                        disabled={isSendingProposal}
                        placeholder="Write your answer to my heart here..."
                        className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 focus:ring-1 focus:ring-[#ffabf3]/50 focus:outline-none text-[#ffdada] font-handwriting text-xl resize-none shadow-inner"
                      />
                      
                      <button
                        onClick={sendProposalAnswer}
                        disabled={!proposalAnswer.trim() || isSendingProposal}
                        className="w-full bg-gradient-to-r from-[#800020] to-[#a41031] text-[#ffdada] hover:scale-102 active:scale-98 transition-all font-semibold uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40"
                      >
                        <span>{isSendingProposal ? 'Sending Response...' : 'Send My Answer'}</span>
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4 py-6 max-w-sm mx-auto"
                  >
                    <span className="text-6xl animate-bounce">💖</span>
                    <h3 className="font-serif italic text-3.5xl text-[#ffb3b5]">Answer Dispatched</h3>
                    <p className="font-handwriting text-2.5xl text-white/95 leading-relaxed">
                      "Your response has been securely sent directly to my inbox. I love you."
                    </p>
                  </motion.div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* SVG Mask Definition for Heart-shaped Photos */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0.232 C 0.444 0.082, 0.278 0.024, 0.139 0.134 C -0.014 0.254, -0.046 0.485, 0.111 0.697 C 0.241 0.871, 0.435 0.98, 0.5 1 C 0.565 0.98, 0.759 0.871, 0.889 0.697 C 1.046 0.485, 1.014 0.254, 0.861 0.134 C 0.722 0.024, 0.556 0.082, 0.5 0.232" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
