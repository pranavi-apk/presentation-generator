import pptxgen from "pptxgenjs";

const themeColors: Record<string, { background: string; color: string; accent: string; font: string }> = {
  modern: { background: "F3F4F6", color: "111827", accent: "4F46E5", font: "Helvetica" },
  dark: { background: "020617", color: "F8FAFC", accent: "60A5FA", font: "Helvetica" },
  nature: { background: "F5F5F4", color: "292524", accent: "047857", font: "Georgia" },
  professional: { background: "FFFFFF", color: "0F172A", accent: "1E40AF", font: "Arial" },
  cyberpunk: { background: "000000", color: "FF66C4", accent: "22D3EE", font: "Courier New" },
};

// Fallback for unknown themes
const defaultTheme = themeColors.modern;

export const exportToPPTX = async (presentation: any, themeName: string = "modern") => {
  const pres = new pptxgen();
  const theme = themeColors[themeName] || defaultTheme;

  pres.layout = "LAYOUT_16x9";
  pres.title = presentation.title || "Untitled Presentation";

  // Define Master Slide to set background globally
  pres.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: theme.background },
  });

  // Title Slide
  if (presentation.slides.length > 0) {
      const titleSlide = presentation.slides[0];
      const slide = pres.addSlide({ masterName: "MASTER_SLIDE" });
      
      slide.addText(titleSlide.title, { 
          x: 1, y: 1.5, w: "80%", h: 2, 
          fontSize: 44, bold: true, align: "center", 
          color: theme.accent, fontFace: theme.font
      });
      
      slide.addText("Presented with Gemini AI", {
          x: 2, y: 4, w: "60%", h: 0.5,
          fontSize: 14, align: "center",
          color: theme.color, fontFace: theme.font, transparency: 30
      });

      slide.addNotes(titleSlide.speakerNotes || "");
  }

  // Remaining Slides
  for (let i = 1; i < presentation.slides.length; i++) {
      const slideData = presentation.slides[i];
      const slide = pres.addSlide({ masterName: "MASTER_SLIDE" });

      // Slide Title
      slide.addText(slideData.title, { 
          x: 0.5, y: 0.4, w: "90%", h: 0.8, 
          fontSize: 28, bold: true, 
          color: theme.accent, fontFace: theme.font 
      });

      // Divide line
      slide.addShape(pres.ShapeType.line, { 
          x: 0.5, y: 1.2, w: "90%", h: 0, 
          line: { color: theme.accent, width: 2, transparency: 50 } 
      });

      // Content
      if (slideData.layout === "image-text") {
          // Add Text on Left
          if (slideData.content) {
            slideData.content.forEach((point: string, idx: number) => {
                slide.addText(`• ${point}`, { 
                    x: 0.5, y: 1.5 + (idx * 0.6), w: "45%", h: 0.6, 
                    fontSize: 18, color: theme.color, fontFace: theme.font 
                });
            });
          }
          
          // Add Image on Right
          if (slideData.backgroundImage) {
              try {
                slide.addImage({ 
                    path: slideData.backgroundImage, 
                    x: 5.5, y: 1.5, w: 4, h: 3 
                });
              } catch (e) {
                  console.error("Failed to add image to PPTX", e);
              }
          }

      } else {
          // Standard Content Layout
          if (slideData.content) {
              slideData.content.forEach((point: string, idx: number) => {
                  slide.addText(`• ${point}`, { 
                      x: 1, y: 1.5 + (idx * 0.6), w: "80%", h: 0.6, 
                      fontSize: 20, color: theme.color, fontFace: theme.font 
                  });
              });
          }
      }
      
      slide.addNotes(slideData.speakerNotes || "");
  }

  pres.writeFile({ fileName: `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx` });
};
