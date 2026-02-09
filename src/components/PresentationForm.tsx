import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { type ThemeName, themes } from "../lib/themes";

interface PresentationFormProps {
  onGenerate: (topic: string, slideCount: number, theme: ThemeName) => void;
  isLoading: boolean;
}

export const PresentationForm = ({ onGenerate, isLoading }: PresentationFormProps) => {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(8);
  const [theme, setTheme] = useState<ThemeName>("modern");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate(topic, slideCount, theme);
  };

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

        <div className="grid grid-cols-2 gap-6">
          {/* Slide Count Input */}
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

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Visual Style</label>
            <select
              className="w-full p-4 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeName)}
            >
              {Object.keys(themes).map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="button"
        hidden
      ></button>

      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
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
