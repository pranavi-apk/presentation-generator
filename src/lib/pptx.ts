import pptxgen from "pptxgenjs";

const themeColors: Record<string, { background: string; color: string; accent: string; font: string }> = {
  modern: { background: "F3F4F6", color: "111827", accent: "4F46E5", font: "Helvetica" },
  dark: { background: "020617", color: "F8FAFC", accent: "60A5FA", font: "Helvetica" },
  nature: { background: "F5F5F4", color: "292524", accent: "047857", font: "Georgia" },
  professional: { background: "FFFFFF", color: "0F172A", accent: "1E40AF", font: "Arial" },
  cyberpunk: { background: "000000", color: "FF66C4", accent: "22D3EE", font: "Courier New" },
  none: { background: "FFFFFF", color: "000000", accent: "000000", font: "Helvetica" },
};

// Fallback for unknown themes
const defaultTheme = themeColors.modern;

const removeMarkdown = (text: string) => {
  return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").trim();
};

// Helper to get layout-specific font setting removed as it was unused and handled in-flow


// Helper to get layout-specific background
const getLayoutBackground = (layoutId: string, themeBg: string) => {
    if (layoutId === 'playful') return "FFFDF5"; // Cream
    if (layoutId === 'abstract') return "FFFFFF";
    if (layoutId === 'retro') return "FDF6E3"; // Vintage Paper
    if (layoutId === 'swiss') return "FFFFFF";
    return themeBg;
};

export const exportToPPTX = async (presentation: any, themeName: string = "modern", layoutId: string = "default") => {
  const pres = new pptxgen();
  const theme = themeColors[themeName] || defaultTheme;
  
  const bgColor = getLayoutBackground(layoutId, theme.background);

  
  pres.layout = "LAYOUT_16x9";
  pres.title = presentation.title || "Untitled Presentation";
  pres.defineSlideMaster({ title: "MASTER", background: { color: bgColor } });

  // Helper to add slides
  const addSlide = () => pres.addSlide({ masterName: "MASTER" });

  presentation.slides.forEach((slideData: any, index: number) => {

      const slide = addSlide();
      const title = removeMarkdown(slideData.title);
      const points = (slideData.content || []).map(removeMarkdown);

      // --- LAYOUT: SWISS ---
      if (layoutId === 'swiss') {
          slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: 5.625, fill: { color: 'B91C1C' } }); // Red Left Border
          
          if (slideData.layout === 'title') {
              slide.addText(title.toUpperCase(), { 
                  x: 0.5, y: 2, w: 9, h: 2, 
                  fontSize: 72, bold: true, color: '000000', fontFace: 'Arial Black', 
                  charSpacing: -2, lineSpacing: 0.8, valign: 'bottom'
              });
              slide.addShape(pres.ShapeType.rect, { x: 0.5, y: 4.2, w: 9, h: 0.15, fill: { color: '000000' } });
              slide.addText("PRESENTATION", { x: 0.5, y: 4.5, w: 9, h: 0.5, fontSize: 24, bold: true, color: '000000', fontFace: 'Arial', charSpacing: 10 });
          } else {
              slide.addText(title, { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 44, bold: true, color: '000000', fontFace: 'Arial Black' });
              
              const isImage = slideData.layout === 'image-text' && slideData.backgroundImage;
              const imageOnRight = index % 2 === 0;
              const contentW = isImage ? 4.5 : 8.5;
              const textX = isImage ? (imageOnRight ? 0.5 : 5) : 0.5;
              
              points.forEach((p: string, i: number) => {
                  const y = 1.8 + (i * 0.8);
                  slide.addShape(pres.ShapeType.line, { x: textX, y, w: contentW, h: 0, line: { color: '000000', transparency: 80, width: 0.5 } });
                  slide.addText(`0${i+1}.`, { x: textX, y: y+0.1, w: 0.5, h: 0.5, fontSize: 18, bold: true, color: '000000' });
                  slide.addText(p, { x: textX + 0.5, y: y+0.1, w: contentW - 0.5, h: 0.5, fontSize: 18, color: '000000', fontFace: 'Arial' });
              });

              if (isImage) {
                  slide.addImage({ 
                    path: slideData.backgroundImage, 
                    x: imageOnRight ? 5.5 : 0.5, y: 0.8, w: 4, h: 4, 
                    sizing: { type: 'cover', w: 4, h: 4 } 
                  });
              }
          }


      // --- LAYOUT: EDITORIAL ---
      } else if (layoutId === 'editorial') {
          const isImage = slideData.backgroundImage;
          const bgFill = "F8F9FA";
          
          if (isImage) {
              const imageOnRight = index % 2 === 0;
              // Text column
              slide.addShape(pres.ShapeType.rect, { x: imageOnRight ? 0 : 5, y: 0, w: 5, h: 5.625, fill: { color: bgFill } });
              slide.addShape(pres.ShapeType.line, { x: 5, y: 0, w: 0, h: 5.625, line: { color: 'E5E7EB', width: 1 } });
              
              const textX = imageOnRight ? 0.5 : 5.5;

              if (slideData.layout === 'title') {
                  slide.addText("VOLUME 1", { 
                      x: textX, y: 1.5, w: 4, h: 0.4, 
                      fontSize: 14, italic: true, color: '1A1A1A', 
                      fontFace: 'Times New Roman', charSpacing: 5
                  });
                  slide.addShape(pres.ShapeType.line, { x: textX, y: 1.9, w: 1, h: 0, line: { color: '1A1A1A', width: 1 } });
                  slide.addText(title, { 
                      x: textX, y: 2.1, w: 4, h: 1.5, 
                      fontSize: 48, italic: true, color: '1A1A1A', 
                      fontFace: 'Times New Roman' 
                  });
              } else {
                  slide.addText(title, { 
                      x: textX, y: 0.5, w: 4, h: 0.8, 
                      fontSize: 32, italic: true, color: '1A1A1A', 
                      fontFace: 'Times New Roman' 
                  });
                  slide.addShape(pres.ShapeType.line, { x: textX, y: 1.3, w: 4, h: 0, line: { color: 'E5E7EB', width: 1 } });
                  
                  const textPoints = points.map((p: string) => ({ text: `— ${p}`, options: { breakLine: true, color: '333333', fontFace: 'Arial', fontSize: 16 } }));
                  slide.addText(textPoints, { x: textX, y: 1.6, w: 4, h: 3.5, lineSpacing: 24 });
              }

              // Image column
              slide.addImage({ 
                path: slideData.backgroundImage, 
                x: imageOnRight ? 5 : 0, y: 0, w: 5, h: 5.625, 
                sizing: { type: 'cover', w: 5, h: 5.625 }
              });
          }
 else {
              // Full Screen Clean Design (No data behind text)
              slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: bgFill } });
              
              if (slideData.layout === 'title') {
                slide.addText("VOLUME 1", { x: 0, y: 1.8, w: 10, h: 0.5, fontSize: 14, italic: true, align: 'center', color: '1A1A1A', fontFace: 'Times New Roman', charSpacing: 5 });
                slide.addShape(pres.ShapeType.line, { x: 4, y: 2.3, w: 2, h: 0, line: { color: '1A1A1A', width: 1 } });
                slide.addText(title, { x: 0, y: 2.6, w: 10, h: 1, fontSize: 60, italic: true, align: 'center', color: '1A1A1A', fontFace: 'Times New Roman' });
              } else {
                slide.addShape(pres.ShapeType.rect, { x: 1.5, y: 0.8, w: 7, h: 4, fill: { color: 'FFFFFF' }, line: { color: 'E5E7EB', width: 1 } });
                slide.addText(title, { x: 1.5, y: 1, w: 7, h: 0.8, fontSize: 36, italic: true, align: 'center', color: '1A1A1A', fontFace: 'Times New Roman' });
                slide.addShape(pres.ShapeType.line, { x: 2.5, y: 1.8, w: 5, h: 0, line: { color: 'E5E7EB', width: 1 } });
                const bulletPoints = points.map((p: string) => ({ text: p, options: { bullet: true, color: '333333' } }));
                slide.addText(bulletPoints, { x: 2, y: 2.2, w: 6, h: 2.4, fontSize: 18, fontFace: 'Arial' });

              }
          }


      // --- LAYOUT: PLAYFUL ---
      } else if (layoutId === 'playful') {
          // Blobs (simulated with large circles)
          slide.addShape(pres.ShapeType.ellipse, { x: 7, y: -1.5, w: 4, h: 4, fill: { color: 'DDD6FE', transparency: 50 } }); // Purple
          slide.addShape(pres.ShapeType.ellipse, { x: -1.5, y: 4, w: 3.5, h: 3.5, fill: { color: 'FFEDD5', transparency: 50 } }); // Orange
          
          if (slideData.layout === 'title') {
               slide.addShape(pres.ShapeType.roundRect, { x: 1.5, y: 1.5, w: 7, h: 2.6, r: 0.3, fill: { color: 'FFFFFF', transparency: 50 }, line: { color: 'FFFFFF', width: 2 } });
               slide.addText(title, { x: 1.5, y: 1.8, w: 7, h: 1.5, fontSize: 54, bold: true, align: 'center', color: '1e293b', fontFace: "Verdana" });
               slide.addShape(pres.ShapeType.roundRect, { x: 4.5, y: 3.4, w: 1, h: 0.15, r: 0.05, fill: { color: 'C084FC' } });
          } else {
               slide.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 0.4, w: 5, h: 0.8, r: 0.2, fill: { color: 'FFFFFF', transparency: 60 }, line: { color: 'FFFFFF' } });
               slide.addText(title, { x: 0.6, y: 0.4, w: 4.8, h: 0.8, fontSize: 32, bold: true, color: '1e293b', fontFace: "Verdana", valign: 'middle' });

               points.forEach((p: string, i: number) => {
                   const y = 1.8 + (i * 0.9);
                   const color = ['C084FC', 'F472B6', 'FB923C'][i % 3]; 
                   slide.addShape(pres.ShapeType.roundRect, { x: 0.8, y, w: 5.5, h: 0.8, r: 0.2, fill: { color: 'FFFFFF', transparency: 40 }, line: { color: 'FFFFFF' } });
                   slide.addShape(pres.ShapeType.ellipse, { x: 1, y: y+0.15, w: 0.5, h: 0.5, fill: { color } });
                   slide.addText((i+1).toString(), { x: 1, y: y+0.15, w: 0.5, h: 0.5, align: 'center', color: 'FFFFFF', bold: true });
                   slide.addText(p, { x: 1.7, y, w: 4.5, h: 0.8, fontSize: 18, color: '334155', fontFace: "Verdana", valign: 'middle' });
               });

               if (slideData.layout === 'image-text' && slideData.backgroundImage) {
                    slide.addImage({ 
                        path: slideData.backgroundImage, 
                        x: 6.8, y: 2.2, w: 2.8, h: 2.8, 
                        rotate: 3,
                        sizing: { type: 'cover', w: 2.8, h: 2.8 }
                    });
                    slide.addShape(pres.ShapeType.roundRect, { x: 6.8, y: 2.2, w: 2.8, h: 2.8, r: 0.1, rotate: 3, line: { color: 'FFFFFF', width: 4 }, fill: { type: 'none' } });
               }
          }
      
      // --- LAYOUT: ABSTRACT ---
      } else if (layoutId === 'abstract') {
          slide.addShape(pres.ShapeType.triangle, { x: 7, y: 0, w: 3, h: 5.6, fill: { color: 'FACC15', transparency: 80 } }); // Yellow
          slide.addShape(pres.ShapeType.ellipse, { x: 1, y: 3.5, w: 1.5, h: 1.5, fill: { color: '3B82F6', transparency: 20 } }); // Blue Circle
          slide.addShape(pres.ShapeType.ellipse, { x: 0.5, y: 0.5, w: 0.8, h: 0.8, fill: { color: '3B82F6', transparency: 80 } }); // Small Blue

          if (slideData.layout === 'title') {
              slide.addText(title, { x: 1, y: 1.5, w: 8, h: 2, fontSize: 64, bold: true, color: '000000', fontFace: "Arial Black" });
              slide.addShape(pres.ShapeType.rect, { x: 1, y: 3.2, w: 3, h: 0.3, fill: { color: '3B82F6', transparency: 30 }, rotate: -2 });
              slide.addText("CREATIVE STRATEGY", { x: 1, y: 3.6, w: 8, h: 0.5, fontSize: 24, fontFace: 'Arial', color: '64748b' });
          } else {
              slide.addShape(pres.ShapeType.rect, { x: 0.8, y: 0.5, w: 0.3, h: 0.3, fill: { color: '000000' } });
              slide.addText(title, { x: 1.2, y: 0.45, w: 8, h: 0.5, fontSize: 36, bold: true, color: '000000', fontFace: "Arial Black" });
              
              const isImage = slideData.layout === 'image-text' && slideData.backgroundImage;
              const contentW = isImage ? 4.5 : 8;

              points.forEach((p: string, i: number) => {
                   const y = 1.5 + (i * 0.9);
                   slide.addShape(pres.ShapeType.ellipse, { x: 0.8, y: y+0.1, w: 0.15, h: 0.15, fill: { color: '3B82F6' } });
                   slide.addText(p, { x: 1.1, y, w: contentW, h: 0.8, fontSize: 20, color: '1e293b', fontFace: "Arial", bold: true });
              });

              if (isImage) {
                  slide.addShape(pres.ShapeType.rect, { x: 5.8, y: 1.5, w: 3.5, h: 3.5, fill: { color: '3B82F6' } }); // Offset BG
                  slide.addImage({ 
                    path: slideData.backgroundImage, 
                    x: 5.6, y: 1.3, w: 3.5, h: 3.5, 
                    sizing: { type: 'cover', w: 3.5, h: 3.5 } 
                  });
              }
          }

      // --- LAYOUT: RETRO ---
      } else if (layoutId === 'retro') {
            slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, line: { color: '2B2B2B', width: 14 }, fill: { type: 'none' } });
            
            if (slideData.layout === 'title') {
                slide.addShape(pres.ShapeType.rect, { x: 1.5, y: 1, w: 7, h: 3.6, line: { color: '433422', width: 2, dashType: 'dash' } });
                slide.addText("VOLUME 01", { x: 0, y: 1.4, w: 10, h: 0.5, align: 'center', color: '9C4B26', charSpacing: 10, bold: true });
                slide.addText(title, { x: 1.5, y: 2, w: 7, h: 1.5, fontSize: 54, bold: true, align: 'center', color: '2B2B2B', fontFace: "Times New Roman" });
                slide.addShape(pres.ShapeType.line, { x: 4.5, y: 3.6, w: 1, h: 0, line: { color: '2B2B2B', width: 2 } });
                slide.addText("THE COLLECTION", { x: 0, y: 3.8, w: 10, h: 0.5, align: 'center', color: '9C4B26', fontFace: 'Times New Roman', italic: true });
            } else {
                slide.addText(title, { x: 0.8, y: 0.6, w: 8, h: 0.8, fontSize: 32, bold: true, color: '2B2B2B', fontFace: "Times New Roman" });
                slide.addShape(pres.ShapeType.line, { x: 0.8, y: 1.4, w: 8.4, h: 0, line: { color: '433422', width: 2 } });
                
                const isImage = slideData.layout === 'image-text' && slideData.backgroundImage;
                const imageOnRight = index % 2 === 0;
                const contentW = isImage ? 4.5 : 8.4;
                const contentX = isImage ? (imageOnRight ? 0.8 : 4.8) : 0.8;

                const textPoints = points.map((p, i) => ({ text: `${i+1}. ${p}`, options: { breakLine: true, color: '433422', fontFace: 'Times New Roman', fontSize: 20 } }));
                slide.addText(textPoints, { x: contentX, y: 1.6, w: contentW, h: 3.5, lineSpacing: 30 });

                if (isImage) {
                    const imgX = imageOnRight ? 5.6 : 0.8;
                    slide.addShape(pres.ShapeType.rect, { x: imgX, y: 1.8, w: 3.6, h: 3.2, fill: { color: 'E8DCC0' }, rotate: 2 });
                    slide.addImage({ 
                        path: slideData.backgroundImage, 
                        x: imgX + 0.1, y: 1.9, w: 3.4, h: 3, 
                        rotate: 2,
                        sizing: { type: 'cover', w: 3.4, h: 3 }
                    });
                }
            }


      // --- DEFAULT ---
      } else {
           slide.addText(title, { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: theme.accent });
           const bulletPoints = points.map((p) => ({ text: p, options: { bullet: true, fontSize: 18, color: theme.color } }));
           if (bulletPoints.length > 0) slide.addText(bulletPoints, { x: 0.5, y: 1.5, w: 9, h: 4 });
           
           if (slideData.backgroundImage) {
               slide.addImage({ 
                 path: slideData.backgroundImage, 
                 x: 6, y: 1.5, w: 3.5, h: 3.5, 
                 sizing: { type: 'cover', w: 3.5, h: 3.5 } 
               });
           }
      }
      
      slide.addNotes(slideData.speakerNotes || "");

  });

  pres.writeFile({ fileName: `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx` });
};
