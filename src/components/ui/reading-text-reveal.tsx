"use client";

import React, { useRef, useEffect, useState } from 'react';

// Conditional class names utility
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
}

interface ReadingTextRevealProps {
  storySegments: string[];
  className?: string;
}

export const ReadingTextReveal = ({ storySegments, className }: ReadingTextRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealedWordCount, setRevealedWordCount] = useState(0);

  const allWords = storySegments.flatMap(segment => segment.split(' '));
  const totalWords = allWords.length;

  useEffect(() => {
    let rafId: number | null = null;
    let targetProgress = 0;
    let currentProgress = 0;

    const smoothScroll = () => {
      const difference = targetProgress - currentProgress;
      currentProgress += difference * 0.12;
      
      if (Math.abs(targetProgress - currentProgress) > 0.001) {
        const wordsToReveal = Math.floor(currentProgress * totalWords);
        setRevealedWordCount(wordsToReveal);
        rafId = requestAnimationFrame(smoothScroll);
      } else {
        setRevealedWordCount(Math.floor(targetProgress * totalWords));
      }
    };

    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const eyeLevel = windowHeight * 0.55; // Trigger scroll reveal slightly above mid-screen
      
      const animationStart = rect.top + window.scrollY - eyeLevel;
      const animationEnd = rect.top + window.scrollY + rect.height - eyeLevel;
      const scrollDistance = animationEnd - animationStart;
      const currentScroll = window.scrollY;
      
      let progress = (currentScroll - animationStart) / scrollDistance;
      targetProgress = Math.max(0, Math.min(1, progress));
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(smoothScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [totalWords]);

  let wordIndex = 0;

  return (
    <div className={cn("w-full transition-colors duration-500", className)}>
      <div
        ref={containerRef}
        className="max-w-2xl mx-auto px-6 py-20"
      >
        <div className="space-y-12">
          {storySegments.map((segment, segmentIndex) => {
            const segmentWords = segment.split(' ');
            const segmentStartIndex = wordIndex;
            wordIndex += segmentWords.length;
            
            return (
              <p
                key={segmentIndex}
                className="text-3xl sm:text-4xl leading-relaxed"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  fontWeight: 600
                }}
              >
                {segmentWords.map((word, i) => {
                  const currentWordIndex = segmentStartIndex + i;
                  const isRevealed = currentWordIndex < revealedWordCount;
                  return (
                    <span
                      key={i}
                      className={isRevealed ? 'text-[#ffdada]' : 'text-gray-700'}
                      style={{
                        transition: 'all 0.25s ease-out',
                        opacity: isRevealed ? 1 : 0.25,
                        textShadow: isRevealed ? '0 0 12px rgba(255,171,243,0.3)' : 'none'
                      }}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};
