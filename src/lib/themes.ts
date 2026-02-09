export type ThemeName = "modern" | "dark" | "nature" | "professional" | "cyberpunk" | "none";

export interface Theme {
  name: ThemeName;
  background: string;
  foreground: string;
  accent: string;
  card: string;
  font: string;
  slideBackground: string;
  borderRadius: string;
  baseFont: string;
}

export const themes: Record<ThemeName, Theme> = {
  none: {
    name: "none",
    background: "bg-white",
    foreground: "text-black",
    accent: "text-black",
    card: "", // No card style
    slideBackground: "", // No slide background
    font: "font-sans",
    borderRadius: "",
    baseFont: "Arial",
  },
  modern: {
    name: "modern",
    background: "bg-gray-100",
    foreground: "text-gray-900",
    accent: "text-indigo-600",
    card: "bg-white shadow-xl",
    slideBackground: "bg-white",
    font: "font-sans",
    borderRadius: "rounded-2xl",
    baseFont: "Inter",
  },
  dark: {
    name: "dark",
    background: "bg-slate-950",
    foreground: "text-slate-50",
    accent: "text-blue-400",
    card: "bg-slate-900 shadow-2xl border border-slate-800",
    slideBackground: "bg-gradient-to-br from-slate-900 to-slate-800",
    font: "font-sans",
    borderRadius: "rounded-xl",
    baseFont: "Inter",
  },
  nature: {
    name: "nature",
    background: "bg-stone-100",
    foreground: "text-stone-800",
    accent: "text-emerald-700",
    card: "bg-stone-50 shadow-lg border border-stone-200",
    slideBackground: "bg-gradient-to-br from-emerald-50 to-stone-100",
    font: "font-serif",
    borderRadius: "rounded-[2rem]",
    baseFont: "Merriweather", // We'll just use serif class for now
  },
  professional: {
    name: "professional",
    background: "bg-white",
    foreground: "text-slate-900",
    accent: "text-blue-800",
    card: "bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]",
    slideBackground: "bg-white",
    font: "font-sans",
    borderRadius: "rounded-none",
    baseFont: "Arial",
  },
  cyberpunk: {
    name: "cyberpunk",
    background: "bg-black",
    foreground: "text-neon-pink",
    accent: "text-cyan-400",
    card: "bg-black border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
    slideBackground: "bg-gradient-to-br from-gray-900 to-black",
    font: "font-mono",
    borderRadius: "rounded-sm",
    baseFont: "Courier New",
  }
};
