import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface AISlideViewerProps {
  slides: Array<{
    title: string;
    contentHtml: string;
  }>;
  currentSlide: number;
  onNext: () => void;
  onPrev: () => void;
}

export const AISlideViewer = ({ slides, currentSlide, onNext, onPrev }: AISlideViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const targetWidth = 1920;
        const targetHeight = 1080;
        
        const scaleW = containerWidth / targetWidth;
        const scaleH = containerHeight / targetHeight;
        setScale(Math.min(scaleW, scaleH));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const slide = slides[currentSlide];

  if (!slide) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/5 rounded-xl overflow-hidden group">
      {/* 16:9 Aspect Ratio Container */}
      <div 
        ref={containerRef}
        className="w-full aspect-video relative bg-white shadow-2xl overflow-hidden"
      >
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 origin-top-left z-0"
            style={{ 
              width: '1920px', 
              height: '1080px',
              transform: `scale(${scale})`
            }}
            dangerouslySetInnerHTML={{ __html: slide.contentHtml }}
          />
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center p-4 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          disabled={currentSlide === 0}
          className="p-3 rounded-full bg-white/90 backdrop-blur shadow-xl hover:bg-white disabled:opacity-0 transition-all transform hover:scale-110 opacity-50 group-hover:opacity-100 border border-black/5"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center p-4 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          disabled={currentSlide === slides.length - 1}
          className="p-3 rounded-full bg-white/90 backdrop-blur shadow-xl hover:bg-white disabled:opacity-0 transition-all transform hover:scale-110 opacity-50 group-hover:opacity-100 border border-black/5"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-6 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur text-white text-sm font-medium z-20 shadow-lg">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};
