import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { themes, type ThemeName } from "../lib/themes";
import { type LayoutId } from "../lib/templates";

interface Slide {
  layout: "title" | "content" | "image-text" | "tableOfContents";
  title: string;
  content?: string[];
  imageKeyword?: string;
  backgroundImage?: string;
  speakerNotes?: string;
  isChart?: boolean;
}


interface SlideViewerProps {
  slides: Slide[];
  currentSlideIndex: number;
  onNext: () => void;
  onPrev: () => void;
  themeName?: ThemeName;
  layoutId?: LayoutId;
}


// Sub-components for different Layout Styles

const StandardLayout = ({ slide, theme, index }: { slide: Slide, theme: any, index: number }) => (

    <div className="relative z-10 h-full flex flex-col">
        {slide.layout === "title" && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <h1 className={clsx("text-6xl font-bold tracking-tight", theme.accent)}>{slide.title}</h1>
            <div className={clsx("w-32 h-2 rounded-full opacity-80", theme.accent.replace("text-", "bg-"))} />
            <p className="text-xl opacity-75 font-light">Presented with Gemini AI</p>
            </div>
        )}
        {slide.layout === "content" && (
            <div className="flex flex-col h-full">
            <h2 className={clsx("text-4xl font-semibold mb-10 pb-4 border-b-2 opacity-90", theme.accent, "border-current/10")}>{slide.title}</h2>
            <ul className="space-y-6 pl-6 list-disc text-xl opacity-90 leading-relaxed flex-1 overflow-y-auto">
                {slide.content?.map((point, i) => <li key={i} className="pl-2">{point}</li>)}
            </ul>
            </div>
        )}
        {slide.layout === "image-text" && (
            <div className="grid grid-cols-2 gap-10 h-full">
            <div className={clsx("flex flex-col justify-center", index % 2 === 0 ? "order-1" : "order-2")}>
                <h2 className={clsx("text-3xl font-bold mb-8", theme.accent)}>{slide.title}</h2>
                <ul className="space-y-4 pl-5 list-disc text-lg opacity-85">
                {slide.content?.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
            </div>
            <div className={clsx(
                "flex items-center justify-center rounded-lg overflow-hidden relative shadow-md bg-gray-200", 
                theme.borderRadius,
                index % 2 === 0 ? "order-2" : "order-1"
            )}>
                {slide.backgroundImage && <img src={slide.backgroundImage} alt="slide" className={clsx("absolute inset-0 w-full h-full", slide.isChart ? "object-contain p-4 bg-white" : "object-cover")} />}
            </div>
            </div>
        )}

        {slide.layout === "tableOfContents" && (
            <div className="flex flex-col h-full justify-center items-center">
                <h2 className={clsx("text-5xl font-bold mb-12", theme.accent)}>Table of Contents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl w-full">
                    {slide.content?.map((point, i) => (
                        <div key={i} className="flex items-center text-xl opacity-80">
                            <span className={clsx("w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold", theme.accent.replace("text-", "bg-"), "text-white")}>{i+1}</span>
                            {point}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const SwissLayout = ({ slide, theme, index }: { slide: Slide, theme: any, index: number }) => (

    <div className="relative z-10 h-full flex flex-col p-4 border-l-8 bg-white text-black" style={{ borderColor: 'currentColor' }}>
        {slide.layout === "title" && (
             <div className="h-full flex flex-col justify-end pb-20">
                <h1 className="text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-4">{slide.title}</h1>
                <div className="w-full h-4 bg-current mb-4"></div>
                <p className="text-2xl font-bold uppercase tracking-widest">Presentation</p>
            </div>
        )}
        {slide.layout !== "title" && (
            <div className="grid grid-cols-12 gap-6 h-full pt-10">
                <div className="col-span-12 mb-8">
                     <h2 className="text-5xl font-bold leading-none tracking-tight">{slide.title}</h2>
                </div>
                
                <div className={clsx(
                    "col-span-12 lg:col-span-5 text-lg font-medium leading-relaxed", 
                    slide.layout === 'image-text' ? index % 2 === 0 ? 'order-1' : 'order-2' : 'col-span-8'
                )}>
                     <ul className="space-y-6 list-none">
                        {slide.content?.map((point, i) => (
                            <li key={i} className="border-t border-current/20 pt-2"><span className="font-bold mr-2">0{i+1}.</span>{point}</li>
                        ))}
                    </ul>
                </div>
                {slide.layout === 'image-text' && (
                    <div className={clsx(
                        "col-span-12 lg:col-span-7 h-full relative",
                        index % 2 === 0 ? "order-2" : "order-1"
                    )}>
                        {slide.backgroundImage && (
                            <img 
                                src={slide.backgroundImage} 
                                className={clsx(
                                    "absolute inset-0 w-full h-full",
                                    slide.isChart ? "object-contain p-4 bg-white" : "object-cover grayscale contrast-125"
                                )} 
                            />
                        )}
                    </div>
                )}
            </div>
        )}

    </div>
);

const EditorialLayout = ({ slide, theme, index }: { slide: Slide, theme: any, index: number }) => (
    <div className="relative z-10 h-full w-full flex bg-[#F8F9FA] text-[#1A1A1A]">
        {slide.backgroundImage ? (
             <div className="grid grid-cols-2 h-full w-full">
                <div className={clsx(
                    "flex flex-col justify-center px-16 text-left border-r border-[#E5E7EB]",
                    index % 2 === 0 ? "order-1" : "order-2 border-l border-r-0"
                )}>
                    {slide.layout === "title" ? (
                        <>
                            <p className="text-sm font-serif italic mb-4 tracking-widest uppercase border-b border-[#1A1A1A] pb-2 self-start">Volume 1</p>
                            <h1 className="text-6xl font-serif italic mb-6 leading-tight">{slide.title}</h1>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-serif italic mb-8 border-b border-[#E5E7EB] pb-4">{slide.title}</h2>
                            <ul className="space-y-4 font-sans text-lg list-none">
                                {slide.content?.map((point, i) => (
                                    <li key={i} className="flex items-start opacity-90">
                                        <span className="mr-3 text-[#1A1A1A]/30 font-serif italic">—</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
                <div className={clsx("relative h-full overflow-hidden", index % 2 === 0 ? "order-2" : "order-1")}>
                    <img src={slide.backgroundImage} className={clsx("w-full h-full", slide.isChart ? "object-contain p-6 bg-white" : "object-cover")} />
                    <div className="absolute inset-0 bg-[#000000]/5" />
                </div>
             </div>

        ) : (
            <div className="relative z-10 h-full w-full flex flex-col justify-center items-center text-center px-20">
                 {slide.layout === "title" ? (
                     <>
                        <p className="text-sm font-serif italic mb-4 tracking-widest uppercase border-b border-current pb-2">Volume 1</p>
                        <h1 className="text-7xl font-serif italic mb-6">{slide.title}</h1>
                     </>
                 ) : (
                     <div className="p-10 border border-[#1A1A1A]/10 shadow-sm max-w-4xl bg-white">
                        <h2 className="text-4xl font-serif italic mb-8 border-b border-[#E5E7EB] pb-4">{slide.title}</h2>
                        <ul className="text-left space-y-4 font-sans text-lg">
                            {slide.content?.map((point, i) => <li key={i} className="list-inside list-disc opacity-90">{point}</li>)}
                        </ul>
                     </div>
                 )}
            </div>
        )}
    </div>
);

// --- NEW CANVA-STYLE TEMPLATES ---

const PlayfulLayout = ({ slide, theme, index }: { slide: Slide, theme: any, index: number }) => (

    <div className="relative h-full flex flex-col bg-[#FFFDF5] text-slate-800 overflow-hidden font-sans">
        {/* Soft Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-50" />

        {slide.layout === "title" ? (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center z-10">
                <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[3rem] border border-white/60 shadow-sm">
                    <h1 className="text-6xl font-black text-slate-800 tracking-tight mb-4">{slide.title}</h1>
                    <div className="w-24 h-2 bg-purple-400 rounded-full mx-auto my-6" />
                    <p className="text-xl text-slate-600 font-medium">Presentation</p>
                </div>
            </div>
        ) : (
            <div className="flex-1 p-10 flex flex-col z-10">
                <h2 className="text-4xl font-black text-slate-800 mb-8 bg-white/40 self-start px-6 py-2 rounded-2xl border border-white/50">
                    {slide.title}
                </h2>
                
                <div className={clsx("flex-1 grid gap-4", slide.layout === 'tableOfContents' ? "grid-cols-2 content-center" : "")}>
                   {slide.content?.map((point, i) => (
                        <div key={i} className={clsx(
                            "flex items-center p-4 bg-white/60 border border-white/50 rounded-2xl shadow-sm",
                            index % 2 !== 0 && "flex-row-reverse"
                        )}>
                            <div className={clsx(
                                `w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${['bg-purple-400', 'bg-pink-400', 'bg-orange-400'][i % 3]}`,
                                index % 2 === 0 ? "mr-4" : "ml-4"
                            )}>
                                {i + 1}
                            </div>
                            <p className={clsx("text-lg font-medium text-slate-700", index % 2 !== 0 && "text-right flex-1")}>{point}</p>
                        </div>
                    ))}
                </div>
                 {slide.layout === 'image-text' && slide.backgroundImage && (
                       <div className={clsx(
                           "absolute bottom-10 w-64 h-64 rounded-3xl overflow-hidden border-4 border-white shadow-lg",
                           index % 2 === 0 ? "right-10 rotate-3" : "left-10 -rotate-3"
                       )}>
                           <img src={slide.backgroundImage} className={clsx("w-full h-full", slide.isChart ? "object-contain p-2 bg-white" : "object-cover")} />
                       </div>
                   )}
            </div>
        )}
    </div>
);


const AbstractLayout = ({ slide, theme, index }: { slide: Slide, theme: any, index: number }) => (

    <div className="relative h-full flex flex-col bg-white text-black overflow-hidden">
        {/* Geometric Shapes */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-yellow-400 clip-triangle opacity-20" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full border-4 border-black/10" />
        <div className="absolute top-20 left-20 w-16 h-16 bg-blue-500 rounded-full mix-blend-multiply opacity-80" />

        {slide.layout === "title" ? (
             <div className="flex-1 flex flex-col justify-center px-16 z-10">
                <h1 className="text-7xl font-bold leading-tight mb-6 max-w-2xl relative">
                    <span className="relative z-10">{slide.title}</span>
                    <div className="absolute -bottom-2 left-0 w-32 h-4 bg-blue-500/30 -rotate-2" />
                </h1>
                <p className="text-2xl font-light text-slate-500">Creative Strategy</p>
            </div>
        ) : (
            <div className="flex-1 p-12 z-10">
                 <div className="flex items-center mb-10">
                    <div className="w-4 h-4 bg-black mr-4" />
                    <h2 className="text-4xl font-bold">{slide.title}</h2>
                 </div>
                 
                 <div className="grid grid-cols-12 gap-12">
                     <div className={clsx(
                         "space-y-6", 
                         slide.layout === 'image-text' ? 'col-span-6' : 'col-span-8',
                         index % 2 !== 0 && "order-2"
                     )}>
                        {slide.content?.map((point, i) => (
                            <div key={i} className={clsx("relative pl-6", index % 2 !== 0 && "pr-6 pl-0")}>
                                <div className={clsx(
                                    "absolute top-2 w-2 h-2 bg-blue-500 rounded-full",
                                    index % 2 === 0 ? "left-0" : "right-0"
                                )} />
                                <p className={clsx("text-xl leading-relaxed font-medium text-slate-800", index % 2 !== 0 && "text-right")}>{point}</p>
                            </div>
                        ))}
                     </div>
                     {slide.layout === 'image-text' && slide.backgroundImage && (
                         <div className={clsx("col-span-6 relative transition-all duration-700", index % 2 !== 0 ? "order-1" : "order-2")}>
                             <div className={clsx("absolute inset-0 bg-blue-500", index % 2 === 0 ? "translate-x-4 translate-y-4" : "-translate-x-4 translate-y-4")} />
                             <img src={slide.backgroundImage} className={clsx("relative w-full h-full border-2 border-black", slide.isChart ? "object-contain p-4 bg-white" : "object-cover")} />
                         </div>
                     )}
                 </div>
            </div>
        )}
    </div>
);


const RetroLayout = ({ slide, theme, index }: { slide: Slide, theme: any, index: number }) => (

    <div className="relative h-full flex flex-col bg-[#FDF6E3] text-[#433422] p-8 border-[16px] border-[#2B2B2B]">
        {slide.layout === "title" ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-[#433422] p-8 dashed-border">
                <div className="uppercase tracking-widest text-[#9C4B26] font-bold mb-4">Volume 01</div>
                <h1 className="text-6xl font-serif font-bold mb-6 text-[#2B2B2B]">{slide.title}</h1>
                <div className="w-16 h-1 bg-[#2B2B2B] mb-6" />
                <p className="text-xl font-serif italic text-[#9C4B26]">The Collection</p>
            </div>
        ) : (
            <div className="flex-1 flex flex-col border-2 border-[#433422] p-8">
                <div className="border-b-2 border-[#433422] pb-4 mb-8 flex justify-between items-end">
                    <h2 className="text-3xl font-serif font-bold text-[#2B2B2B]">{slide.title}</h2>
                    <span className="font-mono text-sm text-[#9C4B26] opacity-70">PAGE {Math.floor(Math.random() * 100)}</span>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-8">
                    <ul className="space-y-4">
                         {slide.content?.map((point, i) => (
                            <li key={i} className="font-serif text-lg leading-relaxed flex">
                                <span className="font-bold text-[#9C4B26] mr-3">{i+1}.</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                    
                    {slide.layout === 'image-text' && slide.backgroundImage && (
                        <div className="relative h-full min-h-[200px] bg-[#E8DCC0] p-2 rotate-1 shadow-md">
                            <img 
                                src={slide.backgroundImage} 
                                className={clsx(
                                    "w-full h-full",
                                    slide.isChart ? "object-contain p-2 bg-white" : "object-cover sepia-[.4]"
                                )} 
                            />
                        </div>
                    )}

                </div>
            </div>
        )}
    </div>
);


export const SlideViewer = ({ slides, currentSlideIndex, onNext, onPrev, themeName = "modern", layoutId = "default" }: SlideViewerProps) => {

  const currentSlide = slides[currentSlideIndex];
  // If template is selected, we might get "none", ensure we handle it
  const theme = themes[themeName] || themes.modern;

  if (!currentSlide) return null;


  const renderLayout = () => {
      // Define intrinsic styles for layouts to prevent "Theme Mixing"
      const swissTheme = { ...theme, accent: "text-red-700", font: "font-sans" };
      
      switch (layoutId) {
          case "swiss": return <SwissLayout slide={currentSlide} theme={swissTheme} index={currentSlideIndex} />;
          case "editorial": return <EditorialLayout slide={currentSlide} theme={theme} index={currentSlideIndex} />;
          case "playful": return <PlayfulLayout slide={currentSlide} theme={theme} index={currentSlideIndex} />;
          case "abstract": return <AbstractLayout slide={currentSlide} theme={theme} index={currentSlideIndex} />;
          case "retro": return <RetroLayout slide={currentSlide} theme={theme} index={currentSlideIndex} />;
          default: return <StandardLayout slide={currentSlide} theme={theme} index={currentSlideIndex} />;
      }

  };

  // Determine if using a custom layout that handles its own background/styling
  const isCustomLayout = layoutId !== "default";

  return (
    <div className={clsx(
        "flex flex-col items-center justify-center w-full h-[600px] overflow-hidden transition-colors duration-500 rounded-xl",
        // Custom layouts should manage their own background completely
        isCustomLayout ? "bg-transparent shadow-none" : clsx("p-8", theme.background, theme.borderRadius, theme.card ? "shadow-xl" : "")
    )}>
      
      {/* Slide Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSlideIndex}-${layoutId}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={clsx(
              "w-full h-full flex flex-col relative overflow-hidden transition-all duration-500", 
              // Only apply card styles and padding for Default layout
              !isCustomLayout && [theme.card, theme.borderRadius, theme.foreground, theme.font, "p-10"],
              // For custom layouts, ensure full width/height
              isCustomLayout && "bg-transparent"
          )}
        >

          {/* Background Gradient for Slide Card - Only for Standard Theme */}
          {!isCustomLayout && <div className={clsx("absolute inset-0 opacity-10 pointer-events-none", theme.slideBackground)} />}

          {renderLayout()}
          
          <div className="absolute bottom-4 right-6 text-xs opacity-40 font-mono z-20">
              {currentSlideIndex + 1} / {slides.length}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-2 z-30">
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
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-30">
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
