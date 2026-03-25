import { useState } from "react";
import { generatePresentation, generateAIDesignedPresentation } from "../lib/gemini";
import { SlideViewer } from "./SlideViewer";
import { AISlideViewer } from "./AISlideViewer";
import { PresentationForm } from "./PresentationForm";
import { exportToPPTX } from "../lib/pptx";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCcw, Loader2 } from "lucide-react";
import { type LayoutId } from "../lib/templates";
import { type ThemeName } from "../lib/themes";
import { renderChartToImage, createRoadmapConfig } from "../lib/charts";
import { exportToPptx } from "dom-to-pptx";


export const PresentationGenerator = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutId>("default");


  const handleGenerate = async (topic: string, slideCount: number, theme: ThemeName, layoutId: LayoutId, quantify: boolean, isAiMode: boolean = false, aiStyle: "creative" | "professional" = "professional", language: string = "English", pdfContent?: string) => {
    setIsLoading(true);
    setError(null);
    setData(null); // Clear previous result
    setCurrentLayout(layoutId);
    try {
      let result;
      if (isAiMode) {
          result = await generateAIDesignedPresentation(topic, slideCount, theme, aiStyle, language, pdfContent, quantify);
      } else {
          result = await generatePresentation(topic, slideCount, theme, quantify, language, pdfContent);
      }


      // Force the generated theme to match the user's selection if the AI decides otherwise
      result.theme = theme; 

      // 2. Process Charts if they exist
      const slidesWithCharts = await Promise.all(result.slides.map(async (slide: any) => {
          if (slide.chart) {
              console.log("Generating chart for slide:", slide.title);
              try {
                  let config;
                  if (slide.chart.type === 'roadmap' && slide.chart.data.milestones) {
                      config = createRoadmapConfig(slide.chart.data.milestones);
                  } else {
                      config = {
                          type: slide.chart.type,
                          data: {
                              labels: slide.chart.data.labels,
                              datasets: [{
                                  label: slide.title,
                                  data: slide.chart.data.values,
                                  backgroundColor: [
                                      '#4F46E5', '#EC4899', '#F97316', '#10B981', '#8B5CF6'
                                  ].slice(0, slide.chart.data.labels.length)
                              }]
                          }
                      };
                  }
                  const chartImage = await renderChartToImage(config);
                  
                  // For AI Designer Mode, we need to inject the chart into the custom HTML
                  if (result.isAiDesigned && slide.contentHtml) {
                      const chartPlaceholder = /\[CHART\]/g.test(slide.contentHtml) ? '[CHART]' : '[IMAGE]';
                      slide.contentHtml = slide.contentHtml.replace(chartPlaceholder, chartImage);
                  }

                  // We treat the chart as a backgroundImage for the layout to "hijack" the image slot
                  return { ...slide, backgroundImage: chartImage, isChart: true, layout: 'image-text' };
              } catch (e) {
                  console.error("Chart generation failed:", e);
              }
          }
          // Fallback if AI asked for image-text but forgot to provide an image
          if (slide.layout === 'image-text' && !slide.backgroundImage) {
              slide.backgroundImage = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&auto=format&fit=crop";
          }
          return slide;
      }));

      result.slides = slidesWithCharts;
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
    
    if (data.isAiDesigned) {
      setIsExporting(true);
      try {
        // Find all off-screen slides we rendered for export
        const slideElements = document.querySelectorAll('.ai-export-slide');
        await exportToPptx(Array.from(slideElements), {
          fileName: `${data.title ? data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'presentation'}.pptx`,
          autoEmbedFonts: true,
          svgAsVector: true
        });
      } catch (err) {
        console.error("DOM to PPTX Export failed:", err);
        setError("PPTX export failed. Check console for details.");
      } finally {
        setIsExporting(false);
      }
    } else {
      // Use the Standard Programmatic Engine
      exportToPPTX(data, data.theme, currentLayout);
    }
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
            <div>
                <h2 className="text-2xl font-bold truncate max-w-md">{data.title || data.slides[0].title}</h2>
                {data.tokensUsed > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono flex items-center gap-1.5 opacity-80">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {data.tokensUsed.toLocaleString()} tokens used
                    </p>
                )}
            </div>
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
                    disabled={isExporting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? "Converting to PPTX..." : "Download PPTX"}
                </button>
            </div>
          </div>

          {data.isAiDesigned ? (
              <AISlideViewer 
                slides={data.slides}
                currentSlide={currentSlide}
                onNext={() => setCurrentSlide(c => Math.min(c + 1, data.slides.length - 1))}
                onPrev={() => setCurrentSlide(c => Math.max(c - 1, 0))}
              />
          ) : (
              <SlideViewer
                slides={data.slides}
                currentSlideIndex={currentSlide}
                onNext={() => setCurrentSlide(c => Math.min(c + 1, data.slides.length - 1))}
                onPrev={() => setCurrentSlide(c => Math.max(c - 1, 0))}
                themeName={data.theme || "modern"}
                layoutId={currentLayout}
              />
          )}

          {/* Speaker Notes */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Speaker Notes</h3>
             <p className="text-foreground/80 leading-loose text-lg font-serif">
               {data.slides[currentSlide].speakerNotes || "No notes for this slide."}
             </p>
          </div>
        </motion.div>
      )}

      {/* Off-screen Render Farm for dom-to-pptx */}
      {data && data.isAiDesigned && (
        <div 
          className="fixed top-[200vh] left-[200vw] pointer-events-none opacity-0"
          aria-hidden="true"
        >
          {data.slides.map((slide: Record<string, any>, index: number) => (
            <div 
              key={`export-${index}`}
              className="ai-export-slide relative bg-white overflow-hidden"
              style={{ width: '1920px', height: '1080px' }}
              dangerouslySetInnerHTML={{ __html: slide.contentHtml || "" }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
