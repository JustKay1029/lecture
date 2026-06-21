import React, { useState, TouchEvent } from 'react';
import { ScreenState } from '../types';

interface SlabsDrawerProps {
  onMoodSelect: (mood: ScreenState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SlabsDrawer({ onMoodSelect, isOpen, setIsOpen }: SlabsDrawerProps) {
  const [startY, setStartY] = useState<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startY === null) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;

    // Swipe up opens, Swipe down closes
    if (diff > 50) {
      setIsOpen(true);
    } else if (diff < -50) {
      setIsOpen(false);
    }
  };

  const handleTouchEnd = () => {
    setStartY(null);
  };

  const moods: Array<{ id: ScreenState; emoji: string; text: string; bg: string }> = [
    { id: 'scrapbook', emoji: '📖', text: 'Our Memory Scrapbook', bg: 'rgba(255, 179, 181, 0.04)' },
    { id: 'miss-you', emoji: '❤️', text: 'I Miss You', bg: 'rgba(255, 179, 181, 0.04)' },
    { id: 'cramps', emoji: '🤕', text: 'My Cramps Are Hurting', bg: 'rgba(255, 179, 181, 0.04)' },
    { id: 'comfort', emoji: '🫂', text: 'I Need Comfort', bg: 'rgba(255, 179, 181, 0.04)' },
    { id: 'lonely', emoji: '🌧️', text: 'I Feel Lonely', bg: 'rgba(255, 179, 181, 0.04)' },
    { id: 'distraction', emoji: '🎮', text: 'I Need a Distraction', bg: 'rgba(255, 179, 181, 0.04)' },
  ];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isOpen ? 'translateY(0%)' : 'translateY(88%)',
      }}
      className="fixed bottom-0 left-0 right-0 h-[78%] glass-panel-custom rounded-t-[2.5rem] p-8 pb-12 flex flex-col border-t border-[#ffb3b5]/20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 shadow-[0_-12px_48px_rgba(0,0,0,0.85)] select-none"
    >
      {/* Draggable visual handle bar */}
      <div 
        className="flex justify-center cursor-pointer py-3 -mt-4 mb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-16 h-1.5 bg-[#ffb3b5]/30 hover:bg-[#ffb3b5]/60 rounded-full transition-colors duration-200" />
      </div>

      <div className="overflow-y-auto flex-1 px-1">
        <h2 className="font-serif italic text-2xl sm:text-3xl text-center mb-8 text-[#ffb3b5] tracking-wide">
          How are you feeling, my love?
        </h2>

        <div className="flex flex-col gap-4 max-w-md mx-auto mb-6">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => {
                onMoodSelect(mood.id);
                setIsOpen(false);
              }}
              style={{ backgroundColor: mood.bg }}
              className="group flex items-center p-5 rounded-2xl border border-[#ffb3b5]/10 text-[#ffdadb] transition-all duration-300 hover:bg-[#ffb3b5]/10 hover:border-[#ffb3b5]/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left shadow-lg overflow-hidden"
            >
              <div className="text-3xl mr-5 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform">
                {mood.emoji}
              </div>
              <div className="text-lg font-light tracking-wide font-sans text-[#ffdada]/90 group-hover:text-white transition-colors">
                {mood.text}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
