import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CrampsViewProps {
  onBack: () => void;
}

export default function CrampsView({ onBack }: CrampsViewProps) {
  const [isBreathingState, setIsBreathingState] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'breathe' | 'inhale' | 'hold' | 'exhale'>('breathe');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseIndexRef = useRef(0); // 0: Inhale, 1: Hold, 2: Exhale

  // Sound generator helper for soothing deep harmonic drone frequency
  const playComfortHum = (frequency: number, duration: number, isStarting: boolean) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Deep relaxing sub-sine wave
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      // Lowpass cutoff for extra warm velvet hum
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, audioCtx.currentTime);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      if (isStarting) {
        gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.5);
      } else {
        gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
      }
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // safe fallbacks if audio blocked
    }
  };

  const handleBreathCycle = () => {
    const phases: Array<{ name: 'inhale' | 'hold' | 'exhale'; freq: number }> = [
      { name: 'inhale', freq: 110 }, // Deep tranquil resonance A
      { name: 'hold', freq: 123 },   // Hold comfort
      { name: 'exhale', freq: 98 }    // Rest and surrender Ground G
    ];

    const currentPhase = phases[phaseIndexRef.current];
    setBreathPhase(currentPhase.name);
    
    // Play relaxing harmonic hum on phase shift
    playComfortHum(currentPhase.freq, 4, currentPhase.name === 'inhale');

    // Proceed to next step after 4000ms
    timerRef.current = setTimeout(() => {
      phaseIndexRef.current = (phaseIndexRef.current + 1) % 3;
      handleBreathCycle();
    }, 4000);
  };

  const startBreathing = () => {
    setIsBreathingState(true);
    phaseIndexRef.current = 0;
    handleBreathCycle();
  };

  const stopBreathing = () => {
    setIsBreathingState(false);
    setBreathPhase('breathe');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const guidelines = [
    {
      title: 'Heat Therapy',
      text: 'Apply a warm heating pad or hot water bottle to your lower abdomen for 15-20 minutes to relax uterine muscle contractions.',
    },
    {
      title: 'Gentle Stretches',
      text: "Rest in Child's Pose (kneel on the floor, sit on your heels, fold forward) or Butterfly Pose to expand pelvic circulation.",
    },
    {
      title: 'Acupressure Point LI4 (Hegu)',
      text: 'Massage the soft webbed space between your thumb and index finger firmly in slow circular motions for 2 minutes.',
    },
    {
      title: 'Acupressure Point SP6 (Sanyinjiao)',
      text: 'Apply firm thumb pressure 4 finger-widths above your inner ankle bone behind the shin bone for immediate relief.',
    },
    {
      title: 'Stay Warm & Hydrated',
      text: 'Sip on warm water with ginger, chamomile, or wild honey tea to actively soothe internal smooth muscle spasms.',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-start px-6 pb-24 relative overflow-y-auto select-none">
      {/* Back Button */}
      <nav className="relative z-20 py-4 max-w-2xl mx-auto w-full">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-[#1a1c1c]/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-[#ffb3b5] font-semibold hover:bg-[#292a2a] hover:border-[#ffb3b5]/30 hover:scale-105 active:scale-95 transition-all border border-[#ffb3b5]/10 cursor-pointer text-sm"
        >
          <span>▲</span>
          <span className="font-handwriting text-lg leading-none">Secret Garden</span>
        </button>
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto w-full flex flex-col gap-8">
        {/* Header Section */}
        <header className="text-center mt-2 flex flex-col items-center">
          <h1 className="font-serif text-4xl sm:text-5xl italic text-[#ffb3b5] mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Cramps Relief
          </h1>
          <p className="text-[#e0bfbf] text-xs sm:text-sm leading-relaxed max-w-md mx-auto opacity-95">
            I'm sending you all my love, warmth, and cozy thoughts. Read the care points below and breathe slowly with me.
          </p>
        </header>

        {/* Care Guidelines Card */}
        <section className="bg-[#1a1c1c]/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ffb3b5]/10 shadow-black/60">
          <h2 className="font-handwriting text-3xl text-[#ffb3b5] text-center mb-6 flex items-center justify-center gap-2">
            Boyfriend's Care Guidelines 🌸
          </h2>
          <ul className="space-y-6 text-[#e0bfbf]/90 text-xs sm:text-sm md:text-base leading-relaxed">
            {guidelines.map((guide, idx) => (
              <li key={idx} className="flex gap-3">
                <Sparkles size={16} className="text-[#ffabf3] shrink-0 mt-1 animate-pulse" />
                <span>
                  <strong className="text-white font-serif tracking-wide mr-1 border-b border-[#ffb3b5]/20 pb-0.5">
                    {guide.title}:
                  </strong>
                  {guide.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Breathing Simulator Component */}
        <section className="flex flex-col items-center justify-center p-8 bg-[#1e2020]/40 rounded-3xl border border-[#ffb3b5]/10 shadow-inner max-w-2xl w-full">
          {/* Inner breathing circle simulator animation */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            {/* Ambient deep pink glow */}
            <div className={`absolute inset-0 bg-[#ffb3b5]/5 rounded-full blur-2xl transition-all duration-1000 ${isBreathingState ? 'opacity-100' : 'opacity-40'}`} />

            {/* Static Outer dashed rim ring */}
            <div className="absolute inset-0 border-2 border-dashed border-[#ffb3b5]/25 rounded-full animate-[spin_40s_linear_infinite]" />

            {/* Glowing breathing state core circle */}
            <motion.div
              animate={{
                scale: breathPhase === 'inhale' ? 1.5 : breathPhase === 'hold' ? 1.5 : 1,
                backgroundColor: breathPhase === 'inhale' ? '#ff828a' : breathPhase === 'hold' ? '#ffabf3' : '#800020',
              }}
              transition={{
                duration: 4,
                ease: 'easeInOut',
              }}
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-black/50 border border-white/10 relative z-10"
            >
              <div className="w-5 h-5 bg-white/30 rounded-full animate-ping absolute" />
              <div className="w-4 h-4 bg-white/40 rounded-full" />
            </motion.div>
          </div>

          <div className="text-center w-full">
            {/* Beautiful real-time action message prompt */}
            <h3 className="text-xl font-serif italic text-[#ffdada] h-8 mb-4">
              {breathPhase === 'breathe' && 'Breathe with me...'}
              {breathPhase === 'inhale' && 'Inhale deeply... 🌬️'}
              {breathPhase === 'hold' && 'Hold gently... 🌸'}
              {breathPhase === 'exhale' && 'Exhale slowly... 🫁'}
            </h3>

            <p className="text-xs text-[#e0bfbf] max-w-xs mx-auto mb-6 leading-relaxed opacity-80 h-10">
              {isBreathingState 
                ? 'Follow the circle visually, feel my presence, and align your breathing to release tension.' 
                : 'Click below to start a relaxing, synchronized companion exercise.'}
            </p>

            <button
              onClick={isBreathingState ? stopBreathing : startBreathing}
              className={`px-8 py-3.5 rounded-full font-bold shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer uppercase tracking-widest text-xs border border-[#ffb3b5]/30 ${
                isBreathingState
                  ? 'bg-transparent text-[#ffb3b5] hover:bg-[#800020]/20'
                  : 'bg-[#ffb3b5] text-[#680018] hover:bg-white hover:text-black hover:scale-105'
              }`}
            >
              {isBreathingState ? 'Pause Exercise' : 'Start Breathing Exercise'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
