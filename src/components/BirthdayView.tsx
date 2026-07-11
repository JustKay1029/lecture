import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Send, Volume2, VolumeX } from 'lucide-react';
import { CircularGallery, GalleryItem } from './ui/circular-gallery';

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

// Shifting background gradients matching each page's photo theme
const BG_GRADIENTS = [
  'linear-gradient(135deg, #1f080c 0%, #060002 100%)', // Page 1: Crimson Letter
  'linear-gradient(135deg, #11071d 0%, #04010a 100%)', // Page 2: Purple Photo 1
  'linear-gradient(135deg, #1c1103 0%, #080500 100%)', // Page 3: Warm Amber Photo 2
  'linear-gradient(135deg, #031c11 0%, #000805 100%)', // Page 4: Cozy Emerald Photo 3
  'linear-gradient(135deg, #1c1803 0%, #080600 100%)', // Page 5: Sunset Bronze Photo 4
  'linear-gradient(135deg, #0e031c 0%, #04010a 100%)', // Page 6: Evening Violet Photo 5
  'linear-gradient(135deg, #030e1c 0%, #00040a 100%)'  // Page 7: Proposal Midnight Blue
];

export default function BirthdayView({ onBack }: BirthdayViewProps) {
  const [stage, setStage] = useState<Stage>('countdown');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [candlesLit, setCandlesLit] = useState([true, true, true]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isLidOff, setIsLidOff] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number; scale: number }>>([]);
  const [bookPage, setBookPage] = useState(0); // 0 to 6
  const [proposalAnswer, setProposalAnswer] = useState('');
  const [isSendingProposal, setIsSendingProposal] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
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

  // Audio trigger
  useEffect(() => {
    if (stage === 'letter' && bgMusicRef.current) {
      bgMusicRef.current.volume = 0.45;
      bgMusicRef.current.play().catch((err) => console.log('Autoplay blocked:', err));
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

  // Gallery items for the 3D gallery
  const galleryItems: GalleryItem[] = [
    {
      common: 'Our Beginning',
      binomial: 'Photo 1',
      photo: { url: photo1, text: 'Memory photo 1', pos: 'center', by: 'Us' }
    },
    {
      common: 'Pure Joy',
      binomial: 'Photo 2',
      photo: { url: photo2, text: 'Memory photo 2', pos: 'center', by: 'Us' }
    },
    {
      common: 'Quiet Warmth',
      binomial: 'Photo 3',
      photo: { url: photo3, text: 'Memory photo 3', pos: 'center', by: 'Us' }
    },
    {
      common: 'Together Always',
      binomial: 'Photo 4',
      photo: { url: photo4, text: 'Memory photo 4', pos: 'center', by: 'Us' }
    },
    {
      common: 'My Favorite Smile',
      binomial: 'Photo 5',
      photo: { url: photo5, text: 'Memory photo 5', pos: 'center', by: 'Us' }
    }
  ];

  // Snaps to 3D circular gallery rotation angles: 0deg, -72deg, -144deg, -216deg, -288deg
  const getGalleryRotation = () => {
    if (bookPage < 1) return 0;
    if (bookPage > 5) return -288;
    return -(bookPage - 1) * 72;
  };

  return (
    <div 
      style={{ background: stage === 'letter' ? BG_GRADIENTS[bookPage] : undefined }}
      className="min-h-screen w-full flex flex-col justify-start px-4 pb-20 relative overflow-y-auto select-none transition-all duration-1000 ease-in-out"
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
        className="fixed top-0 left-4 z-50 bg-[#800020] text-[#ffdada] px-4 py-2 hover:py-2.5 rounded-b-xl shadow-xl flex flex-row items-center gap-2 transition-all cursor-pointer border-x border-b border-[#ffb3b5]/30 group active:scale-95"
      >
        <span className="text-xs group-hover:-translate-x-0.5 transition-transform">◀</span>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase">
          Garden
        </span>
      </button>

      {/* Primary Workspace */}
      <main className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center justify-center py-16 min-h-screen">
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
              className="w-full flex flex-col items-center text-center gap-6"
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
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-[#ffdada]/20" />
                  
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
                    setStage('letter');
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

          {/* STAGE 4: ENLARGED PRESENTATION (Lyrics Removed, Mobile Centered) */}
          {stage === 'letter' && (
            <motion.div
              key="letter-stage"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* Header bar controls */}
              <div className="w-full flex justify-between items-center px-1">
                <div className="text-xs uppercase tracking-widest text-[#ffdada]/60 font-sans">
                  Step {bookPage + 1} of 7
                </div>

                {/* Music volume toggle */}
                <button
                  onClick={() => {
                    if (bgMusicRef.current) {
                      bgMusicRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-custom border border-[#ffb3b5]/20 text-xs text-[#ffb3b5] active:scale-95 cursor-pointer"
                >
                  {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{isMuted ? 'Muted' : 'Music playing 🌻'}</span>
                </button>
              </div>

              {/* Main Content card: Single column, enlarged view */}
              <div className="w-full glass-card-custom rounded-3xl p-6 border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl flex flex-col h-[70vh] justify-between relative overflow-hidden">
                
                {/* Page Content viewport */}
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-custom flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={bookPage}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4 }}
                      className="h-full flex flex-col justify-center"
                    >
                      
                      {/* PAGE 1: THE LETTER */}
                      {bookPage === 0 && (
                        <div className="flex flex-col gap-4 text-[#ffdada]/95 py-2">
                          <h3 className="font-serif italic text-2xl sm:text-3xl text-[#ffb3b5] border-b border-white/10 pb-2.5 text-center">
                            Happy Birthday, My Princess 🌹
                          </h3>
                          <p className="font-handwriting text-2xl leading-relaxed">
                            Dearest Isha,
                          </p>
                          <p className="font-handwriting text-2xl leading-relaxed">
                            Happy birthday to the most beautiful, loving, and amazing person in my world. From the moment you entered my life, you turned every simple corner of it into a magical sanctuary. Even in moments of distance, you are the whisper in the wind that brings me warmth.
                          </p>
                          <p className="font-handwriting text-2xl leading-relaxed">
                            I built this secret garden just for you—a small space to remind you of how cherished, loved, and valued you are, every single second of the day. May this year bring you all the warmth, laughter, and stars that you deserve.
                          </p>
                          <p className="font-handwriting text-2xl leading-relaxed text-right mt-4 italic">
                            Forever and always yours, ❤️
                          </p>
                        </div>
                      )}

                      {/* PHOTO PAGES 2-6: ENLARGED 3D CircularGallery */}
                      {bookPage >= 1 && bookPage <= 5 && (
                        <div className="relative w-full h-[48vh] flex flex-col items-center justify-center overflow-hidden">
                          
                          {/* Enlarged 3D Circular Gallery */}
                          <div className="w-full h-full absolute inset-0 z-10 flex items-center justify-center">
                            <CircularGallery 
                              items={galleryItems} 
                              radius={190} // Enlarged radius optimized for centered mobile view
                              activeRotation={getGalleryRotation()}
                            />
                          </div>
                          
                          {/* Captions box */}
                          <div className="absolute bottom-1 z-20 bg-black/60 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 max-w-[85%]">
                            <p className="font-handwriting text-2xl text-[#ffdadb] italic text-center">
                              {bookPage === 1 && "Looking back at one of my favorite moments of you..."}
                              {bookPage === 2 && "Every smile of yours prints a permanent light in my heart."}
                              {bookPage === 3 && "Even in quiet spaces, your memory keeps me complete."}
                              {bookPage === 4 && "You are my shelter, my peaceful sky, and my anchor."}
                              {bookPage === 5 && "Thank you for being you, for every single second."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* PAGE 7: THE PROPOSAL */}
                      {bookPage === 6 && (
                        <div className="flex flex-col justify-center h-full gap-4 text-center py-2">
                          {!proposalSent ? (
                            <>
                              <h3 className="font-serif italic text-3xl text-[#ffb3b5]">
                                Will this birthday girl be my Forever?
                              </h3>
                              <h4 className="font-serif italic text-3.5xl text-[#ffd700] animate-pulse">
                                My Wife? 💍
                              </h4>

                              <div className="mt-2 flex flex-col gap-3.5">
                                <textarea
                                  value={proposalAnswer}
                                  onChange={(e) => setProposalAnswer(e.target.value)}
                                  disabled={isSendingProposal}
                                  placeholder="Write your answer to my heart here..."
                                  className="w-full h-24 bg-[#121414]/50 border border-white/10 rounded-2xl p-4 focus:ring-1 focus:ring-[#ffabf3]/50 focus:outline-none text-[#ffdada] font-handwriting text-xl resize-none"
                                />
                                
                                <button
                                  onClick={sendProposalAnswer}
                                  disabled={!proposalAnswer.trim() || isSendingProposal}
                                  className="w-full bg-gradient-to-r from-[#800020] to-[#a41031] text-[#ffdada] hover:scale-102 active:scale-98 transition-all font-semibold uppercase tracking-wider py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40"
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
                              <span className="text-5xl animate-bounce">💖</span>
                              <h3 className="font-serif italic text-2xl text-[#ffb3b5]">Answer Dispatched</h3>
                              <p className="font-handwriting text-2xl text-white/95 leading-relaxed max-w-xs">
                                "Your response has been securely sent directly to my inbox. I love you."
                              </p>
                            </motion.div>
                          )}
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Page-turn Navigation */}
                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                  <button
                    onClick={() => setBookPage((prev) => Math.max(0, prev - 1))}
                    disabled={bookPage === 0}
                    className="p-2 rounded-full border border-white/10 text-[#ffb3b5] hover:bg-[#800020]/25 transition-all disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <span className="text-[10px] font-semibold text-[#ffdada]/60 font-sans tracking-wide">
                    {bookPage === 0 ? 'Start reading 📖' : bookPage === 6 ? 'The final step 💍' : 'Slide for more Memories'}
                  </span>

                  <button
                    onClick={() => setBookPage((prev) => Math.min(6, prev + 1))}
                    disabled={bookPage === 6}
                    className="p-2 rounded-full border border-white/10 text-[#ffb3b5] hover:bg-[#800020]/25 transition-all disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
