'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function VideoPlayer({ videoIds }: { videoIds: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videoIds || videoIds.length === 0) {
    return (
      <div className="w-full aspect-video bg-slate-900/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400">
        No videos available for this module.
      </div>
    );
  }

  const nextVideo = () => setCurrentIndex((prev) => (prev + 1) % videoIds.length);
  const prevVideo = () => setCurrentIndex((prev) => (prev - 1 + videoIds.length) % videoIds.length);

  return (
    <div className="relative w-full aspect-video bg-black/80 rounded-2xl overflow-hidden shadow-2xl group">
      <AnimatePresence mode="wait">
        <motion.iframe
          key={videoIds[currentIndex]}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          src={`https://www.youtube.com/embed/${videoIds[currentIndex]}?rel=0`}
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </AnimatePresence>
      
      {videoIds.length > 1 && (
        <>
          <button 
            onClick={prevVideo}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextVideo}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {videoIds.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
