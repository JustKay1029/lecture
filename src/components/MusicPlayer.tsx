import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, Music, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../types';
import thinkingOfYouMp3 from '../assets/Thinking Of You - AP Dhillon.mp3';

const PLAYLIST: Song[] = [
  {
    id: '3',
    title: 'Thinking Of You',
    artist: 'AP Dhillon',
    url: thinkingOfYouMp3,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop', // beautiful pink flower theme
  },
  {
    id: '1',
    title: 'Midnight Reverie',
    artist: 'Cozy Piano Suite',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // reliable instrumental stream
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi86qeaBZjx75FRceDWc_0y9fIl0r5rVWI4Tx4Ji8HpY-Qwj2Icw7Qb4bO5mhNgaqFD64rXXu9lqAC-KEBZ4DZFs6yYVv6XlbenwWawe9JUlAkHBmDIxgMHOCGoFltmQHpQkpnVSKrmB-Al5PrslvUXx5Om_xcGLZgzyuLtSwgvadygz6UAjBNaRDpog9M5TP-zIOUCfdezwxS47dLW0fvhbvS6RBp6kuGtOlOgf6PGJxjgCRXdZgA3zmLL9V0Q4adpZkCJ3skid9u',
  },
  {
    id: '2',
    title: 'Our Sweet Melody',
    artist: 'Lofi Valentine',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi86qeaBZjx75FRceDWc_0y9fIl0r5rVWI4Tx4Ji8HpY-Qwj2Icw7Qb4bO5mhNgaqFD64rXXu9lqAC-KEBZ4DZFs6yYVv6XlbenwWawe9JUlAkHBmDIxgMHOCGoFltmQHpQkpnVSKrmB-Al5PrslvUXx5Om_xcGLZgzyuLtSwgvadygz6UAjBNaRDpog9M5TP-zIOUCfdezwxS47dLW0fvhbvS6RBp6kuGtOlOgf6PGJxjgCRXdZgA3zmLL9V0Q4adpZkCJ3skid9u',
  }
];

export default function MusicPlayer() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const song = PLAYLIST[currentSongIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Auto-play block by browser safety
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSongIndex]);

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSongIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={song.url}
        loop
        preload="auto"
      />

      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* MINIMIZED VIEW: A floating gorgeous spinning record vinyl circle */
          <motion.button
            key="minimized-song-circle"
            initial={{ scale: 0.8, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.8, opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsExpanded(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#1e2020]/90 border border-[#ffb3b5]/30 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.6)] focus:outline-none select-none hover:scale-110 active:scale-95 transition-all"
            title="Click to interact with sanctuary music player..."
          >
            {/* Spinning outward glow rings */}
            {isPlaying && (
              <div className="absolute inset-0 rounded-full border border-pink-500/40 animate-ping opacity-60 pointer-events-none" />
            )}

            {/* Glowing active neon outline index circle */}
            <div className={`absolute inset-0.5 rounded-full bg-gradient-to-tr from-[#800020] to-transparent opacity-80 pointer-events-none ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`} />

            {/* spinning actual album record vinyl */}
            <div className={`w-11 h-11 rounded-full overflow-hidden relative border border-[#ffabf3]/30 ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <img 
                className="w-full h-full object-cover select-none pointer-events-none" 
                src={song.coverUrl} 
                alt="Melody album artwork"
              />
              {/* Overlay shadow to look like a realistic Vinyl disc profile */}
              <div className="absolute inset-0 bg-black/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#121414] rounded-full border border-[#ffb3b5]/40" />
            </div>

            {/* Floating micro notes */}
            {isPlaying && (
              <>
                <span className="absolute -top-1 -left-1 text-[10px] animate-bounce duration-1000">♫</span>
                <span className="absolute -bottom-1 -right-0.5 text-[10px] animate-pulse duration-700 delay-300">♪</span>
              </>
            )}

            {/* Hover tooltip hint */}
            <div className="absolute top-16 right-0 scale-0 group-hover:scale-100 bg-[#2e0409]/95 text-white/90 text-[10px] px-2.5 py-1.5 rounded-lg border border-[#ffb3b5]/20 font-sans tracking-wide whitespace-nowrap shadow-xl transition-all duration-300 pointer-events-none">
              🎵 click to open music
            </div>
          </motion.button>
        ) : (
          /* EXPANDED VIEW: Complete audio interface controller panel card */
          <motion.div
            key="expanded-music-panel"
            initial={{ scale: 0.9, opacity: 0, x: 30 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.9, opacity: 0, x: 30 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="flex items-center gap-3.5 pl-3.5 pr-4 py-3 bg-[#1e2020]/95 backdrop-blur-md rounded-full shadow-[0_12px_45px_black] border border-[#ffb3b5]/30 max-w-[280px]"
          >
            {/* Clickable record vinyl to collapse back */}
            <button 
              className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative border-2 border-[#ffabf3]/30 cursor-pointer hover:scale-105 transition-transform ${isPlaying ? 'animate-spin-slow' : ''}`}
              onClick={() => setIsExpanded(false)}
              title="Click to minimize player..."
            >
              <img 
                className="w-full h-full object-cover select-none pointer-events-none" 
                src={song.coverUrl} 
                alt={song.title}
              />
              <div className="absolute inset-0 bg-black/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#121414] rounded-full border border-[#ffb3b5]/40" />
            </button>

            {/* Text details area */}
            <div className="flex flex-col min-w-0 max-w-[100px] select-none cursor-pointer" onClick={() => setIsExpanded(false)}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#ffb3b5] opacity-90 flex items-center gap-1">
                <span className={isPlaying ? 'animate-pulse' : ''}>🎵</span> 
                {isPlaying ? 'Now Playing' : 'Paused'}
              </span>
              <span className="text-[11px] font-semibold text-[#e3e2e2] truncate" title={song.title}>{song.title}</span>
            </div>

            {/* Controller elements */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Play Pause button */}
              <button 
                onClick={handlePlayPause}
                className="p-1.5 rounded-full bg-[#800020]/50 hover:bg-[#800020] text-[#ffb3b5] hover:text-white transition-colors cursor-pointer shadow-md"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={12} className="fill-current" /> : <Play size={12} className="fill-current ml-0.5" />}
              </button>

              {/* Next Track Button */}
              <button 
                onClick={handleNext}
                className="p-1.5 rounded-full bg-[#2a080d] hover:bg-[#800020]/60 text-[#ffb3b5] transition-colors cursor-pointer"
                title="Next Track"
              >
                <SkipForward size={12} />
              </button>

              {/* Mute Toggler Button */}
              <button
                onClick={toggleMute}
                className="p-1.5 text-[#ffb3b5] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>

              {/* Minimize action chevron button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-[#ffb3b5]/60 hover:text-[#ffb3b5] transition-colors cursor-pointer"
                title="Minimize player"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export { PLAYLIST };
