import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

import clsx from "clsx";

import { type ThemeName, themes } from "../lib/themes";
import { type LayoutId, templates } from "../lib/templates";
import { TemplatePreview } from "./TemplatePreview";

interface PresentationFormProps {
  onGenerate: (topic: string, slideCount: number, theme: ThemeName, layoutId: LayoutId, quantify: boolean) => void;
  isLoading: boolean;
}


export const PresentationForm = ({ onGenerate, isLoading }: PresentationFormProps) => {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(8);
  
  // Design Mode State: 'theme' (Color) vs 'template' (Layout)
  const [designMode, setDesignMode] = useState<"theme" | "template">("theme");
  
  // Initialize as empty string to force explicit selection
  const [theme, setTheme] = useState<ThemeName | "">("modern");
  const [layoutId, setLayoutId] = useState<LayoutId>("default");
  const [isQuantified, setIsQuantified] = useState(false);


  const handleModeSwitch = (mode: "theme" | "template") => {
      setDesignMode(mode);
      // Reset state for the new mode to prevent carry-over
      if (mode === "theme") {
          setLayoutId("default");
          setTheme(""); // Force user to pick a theme
      } else {
          setTheme("none"); // COMPLETELY NEUTRAL
          setLayoutId("swiss"); // Default to first template, not 'default'
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Strict Mode Logic:
    if (designMode === "theme") {
        if (!theme) return; // Prevent submission if no theme selected
        onGenerate(topic, slideCount, theme as ThemeName, "default", isQuantified);
    } else {
        // If Template Mode, enforce 'none' theme to avoid mixing
        onGenerate(topic, slideCount, "none", layoutId, isQuantified);
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
            <div className="grid grid-cols-2 bg-secondary/50 p-1 rounded-xl border border-border">
                <button
                    type="button"
                    onClick={() => handleModeSwitch("theme")}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${designMode === "theme" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Color Theme
                </button>
                <button
                    type="button"
                    onClick={() => handleModeSwitch("template")}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${designMode === "template" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Design Template
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
        ) : (
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
