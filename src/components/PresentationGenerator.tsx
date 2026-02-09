import { useState } from "react";
import { generatePresentation } from "../lib/gemini";
import { SlideViewer } from "./SlideViewer";
import { PresentationForm } from "./PresentationForm";
import { exportToPPTX } from "../lib/pptx";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCcw } from "lucide-react";
import { type ThemeName } from "../lib/themes";

export const PresentationGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (topic: string, slideCount: number, theme: ThemeName) => {
    setIsLoading(true);
    setError(null);
    setData(null); // Clear previous result
    try {
      const result = await generatePresentation(topic, slideCount, theme);
      // Force the generated theme to match the user's selection if the AI decides otherwise
      result.theme = theme; 
      console.log("Generated Data:", result);
      setData(result);
      setCurrentSlide(0);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate presentation. Please check API credits.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPPTX = async () => {
    if (!data) return;
    await exportToPPTX(data, data.theme);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      
      {/* Header - Only verify visible if no data yet to keep focus on presentation */}
      {!data && (
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x pb-2">
            AI Slides
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
             Generate stunning presentations in seconds with Gemini 2.5 Flash and Pexels.
          </p>
        </div>
      )}

      {/* Input Form */}
      <AnimatePresence>
        {!data && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="w-full"
            >
                <PresentationForm onGenerate={handleGenerate} isLoading={isLoading} />
            
                {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mt-6 bg-destructive/10 text-destructive px-6 py-4 rounded-xl text-center border border-destructive/20 max-w-2xl mx-auto"
                >
                    {error}
                </motion.div>
                )}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Presentation Viewer & Controls */}
      {data && data.slides && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="space-y-8"
        >
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/50 backdrop-blur p-4 rounded-2xl border border-border shadow-sm">
            <h2 className="text-2xl font-bold truncate max-w-md">{data.title || data.slides[0].title}</h2>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setData(null)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <RefreshCcw className="w-4 h-4" />
                    New Presentation
                </button>
                <button 
                    onClick={downloadPPTX}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-md active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Download PPTX
                </button>
            </div>
          </div>

          <SlideViewer
            slides={data.slides}
            currentSlideIndex={currentSlide}
            onNext={() => setCurrentSlide(c => Math.min(c + 1, data.slides.length - 1))}
            onPrev={() => setCurrentSlide(c => Math.max(c - 1, 0))}
            themeName={data.theme || "modern"}
          />

          {/* Speaker Notes */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Speaker Notes</h3>
             <p className="text-foreground/80 leading-loose text-lg font-serif">
               {data.slides[currentSlide].speakerNotes || "No notes for this slide."}
             </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
