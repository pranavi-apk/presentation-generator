import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { themes, type ThemeName } from "../lib/themes";

interface Slide {
  layout: "title" | "content" | "image-text";
  title: string;
  content?: string[];
  imageKeyword?: string;
  backgroundImage?: string;
  speakerNotes?: string;
}

interface SlideViewerProps {
  slides: Slide[];
  currentSlideIndex: number;
  onNext: () => void;
  onPrev: () => void;
  themeName?: ThemeName;
}

export const SlideViewer = ({ slides, currentSlideIndex, onNext, onPrev, themeName = "modern" }: SlideViewerProps) => {
  const currentSlide = slides[currentSlideIndex];
  const theme = themes[themeName] || themes.modern;

  if (!currentSlide) return null;

  return (
    <div className={clsx("flex flex-col items-center justify-center w-full h-[600px] p-8 relative overflow-hidden transition-colors duration-500", theme.background, theme.borderRadius)}>
      
      {/* Slide Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={clsx(
              "w-full h-full flex flex-col p-10 relative overflow-hidden transition-all duration-500", 
              theme.card, 
              theme.borderRadius,
              theme.foreground,
              theme.font
          )}
        >
          {/* Background Gradient for Slide Card */}
          <div className={clsx("absolute inset-0 opacity-10 pointer-events-none", theme.slideBackground)} />

          <div className="relative z-10 h-full flex flex-col">
            
            {/* Layout: Title Slide */}
            {currentSlide.layout === "title" && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                <h1 className={clsx("text-6xl font-bold tracking-tight", theme.accent)}>
                    {currentSlide.title}
                </h1>
                <div className={clsx("w-32 h-2 rounded-full opacity-80", theme.accent.replace("text-", "bg-"))} />
                <p className="text-xl opacity-75 font-light">Presented with Gemini AI</p>
                </div>
            )}

            {/* Layout: Content Slide */}
            {currentSlide.layout === "content" && (
                <div className="flex flex-col h-full">
                <h2 className={clsx("text-4xl font-semibold mb-10 pb-4 border-b-2 opacity-90", theme.accent, "border-current/10")}>
                    {currentSlide.title}
                </h2>
                <ul className="space-y-6 pl-6 list-disc text-xl opacity-90 leading-relaxed flex-1 overflow-y-auto">
                    {currentSlide.content?.map((point, i) => (
                    <li key={i} className="pl-2">{point}</li>
                    ))}
                </ul>
                </div>
            )}

            {/* Layout: Image + Text Slide */}
            {currentSlide.layout === "image-text" && (
                <div className="grid grid-cols-2 gap-10 h-full">
                <div className="flex flex-col justify-center">
                    <h2 className={clsx("text-3xl font-bold mb-8", theme.accent)}>
                    {currentSlide.title}
                    </h2>
                    <ul className="space-y-4 pl-5 list-disc text-lg opacity-85">
                    {currentSlide.content?.map((point, i) => (
                        <li key={i}>{point}</li>
                    ))}
                    </ul>
                </div>
                <div className={clsx("flex items-center justify-center rounded-lg overflow-hidden relative shadow-md bg-gray-200", theme.borderRadius)}>
                    {currentSlide.backgroundImage ? (
                        <img 
                            src={currentSlide.backgroundImage} 
                            alt={currentSlide.imageKeyword} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105 duration-700" 
                        />
                    ) : (
                        <div className="text-center p-4 opacity-50">
                            <p className="italic">Image not found</p>
                        </div>
                    )}
                </div>
                </div>
            )}
            
            <div className="absolute bottom-0 right-0 text-sm opacity-40 font-mono">
                {currentSlideIndex + 1} / {slides.length}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
        <button
          onClick={onPrev}
          disabled={currentSlideIndex === 0}
          className={clsx(
            "p-3 rounded-full border border-current/10 transition-all shadow-sm backdrop-blur-sm",
            theme.foreground,
            currentSlideIndex === 0 ? "opacity-0 cursor-not-allowed" : "hover:bg-black/5 active:scale-95 opacity-70 hover:opacity-100"
          )}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          onClick={onNext}
          disabled={currentSlideIndex === slides.length - 1}
          className={clsx(
            "p-3 rounded-full border border-current/10 transition-all shadow-sm backdrop-blur-sm",
            theme.foreground,
            currentSlideIndex === slides.length - 1 ? "opacity-0 cursor-not-allowed" : "hover:bg-black/5 active:scale-95 opacity-70 hover:opacity-100"
          )}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
