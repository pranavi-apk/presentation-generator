import clsx from "clsx";
import { type LayoutId } from "../lib/templates";

interface TemplatePreviewProps {
  layoutId: LayoutId;
  isSelected: boolean;
}

export const TemplatePreview = ({ layoutId, isSelected }: TemplatePreviewProps) => {
  return (
    <div className={clsx(
      "w-full aspect-video rounded-lg overflow-hidden relative transition-all duration-300 border",
      isSelected ? "border-primary shadow-md scale-[1.02]" : "border-border/50 bg-muted/20 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 hover:scale-105"
    )}>
      {/* Standard Layout Preview */}
      {layoutId === "default" && (
        <div className="w-full h-full bg-white p-2 flex flex-col gap-1">
          <div className="w-3/4 h-2 bg-slate-800 rounded-sm" />
          <div className="flex-1 flex gap-2">
            <div className="flex-1 space-y-1 mt-1">
              <div className="w-full h-1 bg-slate-200 rounded-full" />
              <div className="w-5/6 h-1 bg-slate-200 rounded-full" />
              <div className="w-4/6 h-1 bg-slate-200 rounded-full" />
            </div>
            <div className="w-1/3 bg-slate-100 rounded-sm" />
          </div>
        </div>
      )}

      {/* Swiss Layout Preview */}
      {layoutId === "swiss" && (
        <div className="w-full h-full bg-[#f0f0f0] p-2 grid grid-cols-4 gap-1 border-l-4 border-red-600">
           <div className="col-span-4 h-3 bg-black mb-1" />
           <div className="col-span-1 h-full bg-transparent flex flex-col gap-1">
              <div className="w-full h-1 bg-slate-400" />
              <div className="w-full h-1 bg-slate-400" />
           </div>
           <div className="col-span-3 h-full bg-slate-200" />
        </div>
      )}

      {/* Editorial Layout Preview */}
      {layoutId === "editorial" && (
        <div className="w-full h-full bg-slate-800 relative">
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
           <div className="absolute bottom-2 left-2 right-2 text-center flex flex-col items-center gap-1">
              <div className="w-1/2 h-2 bg-white/90 font-serif" />
              <div className="w-3/4 h-1 bg-white/60" />
           </div>
        </div>
      )}
    </div>
  );
};
