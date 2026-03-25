import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

import clsx from "clsx";

import { type ThemeName, themes } from "../lib/themes";
import { type LayoutId, templates } from "../lib/templates";
import { TemplatePreview } from "./TemplatePreview";
import { FileText, X, AlertCircle } from "lucide-react";
import { extractTextFromPdf } from "../lib/pdf";

interface PresentationFormProps {
  onGenerate: (topic: string, slideCount: number, theme: ThemeName, layoutId: LayoutId, quantify: boolean, isAiMode: boolean, aiStyle: "creative" | "professional", language: string, pdfContent?: string) => void;
  isLoading: boolean;
}


export const PresentationForm = ({ onGenerate, isLoading }: PresentationFormProps) => {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(8);
  
  // Design Mode State: 'theme' (Color) vs 'template' (Layout)
  const [designMode, setDesignMode] = useState<"theme" | "template" | "ai">("theme");
  
  // Initialize as empty string to force explicit selection
  const [theme, setTheme] = useState<ThemeName | "">("modern");
  const [layoutId, setLayoutId] = useState<LayoutId>("default");
  const [isQuantified, setIsQuantified] = useState(false);
  const [aiStyle, setAiStyle] = useState<"creative" | "professional">("creative");
  const [language, setLanguage] = useState("English");
  
  // PDF Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const LANGUAGES = [
    "English", "Spanish", "French", "German", "Italian", 
    "Portuguese", "Dutch", "Russian", "Mandarin Chinese", 
    "Cantonese", "Japanese", "Korean", "Hindi", "Arabic", "Bengali"
  ];


  const handleModeSwitch = (mode: "theme" | "template" | "ai") => {
      setDesignMode(mode);
      // Reset state for the new mode to prevent carry-over
      if (mode === "theme") {
          setLayoutId("default");
          setTheme(""); // Force user to pick a theme
      } else if (mode === "template") {
          setTheme("none"); // COMPLETELY NEUTRAL
          setLayoutId("swiss"); // Default to first template, not 'default'
      } else {
          setTheme("none");
          setLayoutId("default");
      }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Please upload a PDF file.");
      return;
    }

    setPdfFile(file);
    setIsAnalyzing(true);
    setPdfError(null);

    try {
      const text = await extractTextFromPdf(file);
      setPdfText(text);
      // Auto-fill topic if empty
      if (!topic) {
        setTopic(`Presentation based on ${file.name}`);
      }
    } catch (err) {
      console.error("PDF Extraction failed:", err);
      setPdfError("Failed to extract text from PDF. Please try another file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfText("");
    setPdfError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Strict Mode Logic:
    if (designMode === "theme") {
        if (!theme) return; // Prevent submission if no theme selected
        onGenerate(topic, slideCount, theme as ThemeName, "default", isQuantified, false, "professional", language, pdfText);
    } else if (designMode === "template") {
        // If Template Mode, enforce 'none' theme to avoid mixing
        onGenerate(topic, slideCount, "none", layoutId, isQuantified, false, "professional", language, pdfText);
    } else {
        onGenerate(topic, slideCount, "none", "default", isQuantified, true, aiStyle, language, pdfText);
    }
  };


  const isSubmitDisabled = isLoading || !topic.trim() || (designMode === 'theme' && !theme);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6 bg-card p-8 rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm">
      <div className="space-y-4">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground ml-1">What would you like to present?</label>
          <input
            type="text"
            placeholder="e.g., The Future of Artificial Intelligence"
            className="w-full p-4 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* PDF Upload Section */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Or Upload PDF Content (Optional)</label>
            {!pdfFile ? (
                <div className="relative group">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full p-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 bg-secondary/20 group-hover:bg-secondary/40 transition-all group-hover:border-primary/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold">Click or drag PDF here</p>
                            <p className="text-xs text-muted-foreground">We'll extract content for your slides</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold truncate max-w-[200px]">{pdfFile.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                                {isAnalyzing ? (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Analyzing content...
                                    </span>
                                ) : (
                                    `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Text extracted`
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={removePdf}
                        className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {pdfError && (
                <div className="flex items-center gap-2 text-destructive text-xs mt-1 ml-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {pdfError}
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Number of Slides</label>
                <input
                type="number"
                min={1}
                max={20}
                className="w-full p-4 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
                required
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Language</label>
                <select
                  className="w-full p-4 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
            </div>
        </div>

        {/* Quantify Data Toggle */}
        <div className="pt-2">
            <button
                type="button"
                onClick={() => setIsQuantified(!isQuantified)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${isQuantified ? 'border-blue-500 bg-blue-50/50' : 'border-dashed border-border hover:border-blue-300 hover:bg-secondary/30'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110", isQuantified ? "bg-blue-500" : "bg-slate-400")}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-sm">Enable Data Insights & Roadmaps</div>
                        <div className="text-[10px] text-muted-foreground">Generates charts, metrics and numerical trends</div>
                    </div>
                </div>
                <div className={clsx("w-10 h-5 rounded-full transition-colors relative", isQuantified ? "bg-blue-500" : "bg-slate-200")}>
                    <div className={clsx("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", isQuantified ? "left-6" : "left-1")} />
                </div>
            </button>
        </div>


        {/* MODE SWITCH */}
        <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Choose your Style</label>
            <div className="grid grid-cols-3 bg-secondary/50 p-1 rounded-xl border border-border">
                <button
                    type="button"
                    onClick={() => handleModeSwitch("theme")}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${designMode === "theme" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Themes
                </button>
                <button
                    type="button"
                    onClick={() => handleModeSwitch("template")}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${designMode === "template" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Templates
                </button>
                <button
                    type="button"
                    onClick={() => handleModeSwitch("ai")}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${designMode === "ai" ? "bg-card shadow-sm text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                >
                    ✨ AI Mode
                </button>
            </div>
        </div>

        {/* CONDITIONAL INPUTS */}
        {designMode === "theme" ? (
             <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium text-muted-foreground ml-1">Select Color Theme</label>
                <select
                className="w-full p-4 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
                >
                <option value="" disabled>Select Theme...</option>
                {Object.keys(themes).map((t) => (
                    <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                ))}
                </select>
                <p className="text-xs text-muted-foreground ml-1">Applies color palette to the Standard layout.</p>
            </div>
        ) : designMode === 'template' ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium text-muted-foreground ml-1">Select Layout Template</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {templates.filter(t => t.id !== 'default').map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setLayoutId(t.id)}
                            className="group flex flex-col items-center gap-2 text-left"
                        >
                            <TemplatePreview layoutId={t.id} isSelected={layoutId === t.id} />
                            <div className="w-full px-1">
                                <div className={`text-xs font-semibold transition-colors ${layoutId === t.id ? 'text-primary' : 'text-foreground/80'}`}>{t.name}</div>
                            </div>
                        </button>
                    ))}
                </div>
             </div>
        ) : (
             <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold">AI-Designer Mode</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setAiStyle("creative")}
                        className={clsx(
                            "p-3 rounded-lg border-2 transition-all text-left group",
                            aiStyle === "creative" ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/40 text-muted-foreground"
                        )}
                    >
                        <div className={clsx("font-bold text-sm", aiStyle === "creative" ? "text-primary" : "")}>Creative</div>
                        <div className="text-[10px] opacity-70">Gradients & Asymmetry</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setAiStyle("professional")}
                        className={clsx(
                            "p-3 rounded-lg border-2 transition-all text-left group",
                            aiStyle === "professional" ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/40 text-muted-foreground"
                        )}
                    >
                        <div className={clsx("font-bold text-sm", aiStyle === "professional" ? "text-primary" : "")}>Professional</div>
                        <div className="text-[10px] opacity-70">Clean & Structured</div>
                    </button>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
                    Gemini will generate high-density slides (50-80 words) with {aiStyle === 'creative' ? 'dynamic artistic layouts' : 'premium corporate structure'} and strict contrast rules.
                </p>
            </div>
        )}
      </div>

      <button
        type="button"
        hidden
      ></button>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full py-4 bg-primary text-primary-foreground text-lg font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Presentation...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Generate Presentation
          </>
        )}
      </button>
    </form>
  );
};
