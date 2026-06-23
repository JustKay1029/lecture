import React, { useState } from 'react';
import { ScreenState } from './types';
import BackgroundParticles from './components/BackgroundParticles';
import MusicPlayer from './components/MusicPlayer';
import SlabsDrawer from './components/SlabsDrawer';
import MissYouView from './components/MissYouView';
import CrampsView from './components/CrampsView';
import ComfortView from './components/ComfortView';
import LonelyView from './components/LonelyView';
import DistractionView from './components/DistractionView';
import ScrapbookView from './components/ScrapbookView';
import BirthdayView from './components/BirthdayView';

export default function App() {
  const [viewState, setViewState] = useState<ScreenState>('garden');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleMoodSelect = (mood: ScreenState) => {
    setViewState(mood);
    setIsDrawerOpen(false);
  };

  const handleBackToGarden = () => {
    setViewState('garden');
    setIsDrawerOpen(false);
  };

  return (
    <div className="relative min-h-screen text-[#e3e2e2] overflow-x-hidden select-none">
      {/* Texture parchment pattern overlay */}
      <div className="paper-texture" />

      {/* Raining Rose Petals & Golden Hearts Canvas */}
      <BackgroundParticles />

      {/* Floating Lo-Fi Music Room Widget */}
      <MusicPlayer />

      {/* Transition Stage / View Engine */}
      <div className="relative z-20 min-h-screen w-full transition-all duration-700">
        {viewState === 'garden' && (
          <main 
            onClick={() => setIsDrawerOpen(true)}
            className="relative h-screen flex flex-col items-center justify-center p-6 text-center z-10 cursor-pointer"
          >
            {/* Core Display Text */}
            <div className="mb-32 transition-all duration-1000 transform scale-100 hover:scale-[1.01]">
              <h1 className="font-serif text-7xl sm:text-8xl md:text-9xl mb-6 tracking-tight drop-shadow-[0_8px_24px_rgba(0,0,0,1)] text-[#ffdada] select-none italic">
                For Isha
              </h1>
              <p className="font-handwriting text-3xl sm:text-4xl text-[#ffb3b5] opacity-90 drop-shadow-[0_4px_12px_rgba(128,0,0,0.8)] leading-normal px-4 max-w-lg mx-auto">
                A secret garden carrying handwritten emotions
              </p>
            </div>

            {/* Slide / Click to open drawer footer prompt */}
            <div className="absolute bottom-28 flex flex-col items-center opacity-80 animate-bounce-up pointer-events-none">
              <span className="text-3xl mb-2 text-[#ffb3b5]">↑</span>
              <span className="text-[11px] font-bold font-sans uppercase tracking-[0.4em] text-[#ffdada]/90">
                Slide to Open
              </span>
            </div>
          </main>
        )}

        {viewState === 'miss-you' && (
          <MissYouView onBack={handleBackToGarden} />
        )}

        {viewState === 'cramps' && (
          <CrampsView onBack={handleBackToGarden} />
        )}

        {viewState === 'comfort' && (
          <ComfortView onBack={handleBackToGarden} />
        )}

        {viewState === 'lonely' && (
          <LonelyView onBack={handleBackToGarden} />
        )}

        {viewState === 'distraction' && (
          <DistractionView onBack={handleBackToGarden} />
        )}

        {viewState === 'scrapbook' && (
          <ScrapbookView onBack={handleBackToGarden} />
        )}

        {viewState === 'birthday' && (
          <BirthdayView onBack={handleBackToGarden} />
        )}
      </div>

      {/* Sliding Mood Menu Drawer (available on the Garden Home state) */}
      {viewState === 'garden' && (
        <SlabsDrawer
          onMoodSelect={handleMoodSelect}
          isOpen={isDrawerOpen}
          setIsOpen={setIsDrawerOpen}
        />
      )}
    </div>
  );
}
