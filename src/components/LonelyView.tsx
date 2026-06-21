import React, { useState } from 'react';
import { Send, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LonelyViewProps {
  onBack: () => void;
}

const REASSURANCES = [
  "I have felt the breeze shift as your letter took flight. Even in silence, your heart echoes in mine. Breathe deep, for the garden always grows toward the light. 🌹",
  "No distance can dim the warmth of my feelings for you. Put your hand over your heart right now, can you feel that slow beat? That is me thinking of you, Isha. 🫂",
  "The sky we look up at is the joint canopy of our sanctuary. Rest your thoughts here, knowing you are deeply cherished, loved, and never truly alone. 🌟",
  "Close your eyes and breathe. I have whispered a thousands comfort notes to the wind, and they are arriving at your doorstep right this very second. 💖",
  "Your worries are safe with me. I have folded them into light origami stars and placed them securely in my thoughts. Rest sweet, my princess. 🧸💤"
];

export default function LonelyView({ onBack }: LonelyViewProps) {
  const [noteText, setNoteText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [activeNote, setActiveNote] = useState('');

  // Sensation chime for paper plane taking flight
  const playWindChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      
      // Sweep frequency up to emulate a tiny flight lift
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, audioCtx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1.2); // E5
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 1.4);
    } catch (e) {}
  };

  const handleSendPlane = () => {
    if (!noteText.trim()) return;

    setIsSending(true);
    playWindChime();

    // Select a beautiful comfort reply
    const selectedReassurance = REASSURANCES[Math.floor(Math.random() * REASSURANCES.length)];
    setActiveNote(selectedReassurance);

    // Duration matching the flying plane transition
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1800);
  };

  const handleReset = () => {
    setNoteText('');
    setIsSent(false);
  };

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
      <main className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-20">
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div
              key="desk-editor"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center gap-2"
            >
              <div className="text-center mb-6">
                <h2 className="font-serif italic text-4xl sm:text-5xl text-[#ffb3b5] mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  I Feel Lonely
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#e0bfbf] max-w-md mx-auto leading-relaxed">
                  Release your secret worries or sweet thoughts into the ether, and let the virtual wind carry them to me.
                </p>
              </div>

              {/* Lined Writing Desk Card */}
              <div className="w-full glass-card-custom rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group border border-[#ffb3b5]/15">
                {/* Visual gradient light edge */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#ffabf3]/30 to-transparent opacity-40" />

                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  disabled={isSending}
                  className="w-full h-56 bg-transparent border-none focus:ring-0 focus:outline-none text-xl sm:text-2xl font-handwriting handwritten-lines text-[#ffdada] placeholder:text-[#584141] resize-none leading-[2.2rem]"
                  placeholder="Write what is on your heart right now..."
                />

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSendPlane}
                    disabled={!noteText.trim() || isSending}
                    className={`relative overflow-hidden group px-6 py-3.5 bg-gradient-to-r from-[#800020] to-[#8e0f28] text-[#ffdada] font-semibold text-xs uppercase tracking-widest rounded-full flex items-center gap-2.5 transition-all shadow-xl border border-[#ffb3b5]/20 cursor-pointer ${
                      noteText.trim() ? 'hover:scale-105 active:scale-95' : 'opacity-40 cursor-default'
                    }`}
                  >
                    <span>Send as Paper Plane</span>
                    <motion.div
                      animate={isSending ? { x: 300, y: -200, scale: 0.2, opacity: 0 } : {}}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                    >
                      <Send size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </motion.div>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sent-reassurance"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md"
            >
              <div className="glass-card-custom rounded-3xl p-8 text-center relative border border-[#ffabf3]/25 bg-[#1e2020]/80 shadow-[0_0_50px_rgba(128,0,32,0.3)]">
                <div className="w-16 h-16 bg-[#ffabf3]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#ffabf3]/20">
                  <span className="text-[#ffabf3] text-3xl animate-pulse">✨</span>
                </div>

                <h3 className="font-serif italic text-3xl text-[#ffb3b5] mb-4">You're Never Alone</h3>
                
                <p className="font-handwriting text-2xl sm:text-3xl text-white/95 leading-relaxed italic px-2 mb-8 select-all">
                  "{activeNote}"
                </p>

                <div className="border-t border-[#ffdada]/15 pt-6">
                  <button
                    onClick={handleReset}
                    className="font-handwriting text-2xl text-[#ffabf3] hover:text-[#ffb3b5] flex items-center gap-1.5 mx-auto transition-colors cursor-pointer group"
                  >
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    Write another note
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
export { REASSURANCES };
