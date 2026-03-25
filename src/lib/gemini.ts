import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export type ThemeName = 'modern' | 'dark' | 'nature' | 'professional' | 'cyberpunk' | 'none';

export const fetchImage = async (query: string) => {
  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
  
  // Sanitize: Take only the first part before a semicolon or comma, and limit to 4 words
  const sanitizedQuery = query.split(/[;,]/)[0].trim().split(/\s+/).slice(0, 4).join(" ");
  
  try {
    // 1. Try Unsplash (Higher Quality)
    if (UNSPLASH_ACCESS_KEY) {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(sanitizedQuery)}&orientation=landscape&per_page=1`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );
      const data = await response.json();
      if (data.results?.[0]?.urls?.regular) return data.results[0].urls.regular;
    }

    // 2. Try Pixabay (Fallback)
    if (PIXABAY_API_KEY) {
      const response = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(sanitizedQuery)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3`
      );
      const data = await response.json();
      if (data.hits?.[0]?.largeImageURL) return data.hits[0].largeImageURL;
    }

    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&auto=format&fit=crop";
  } catch (error) {
    console.error("Error fetching images:", error);
    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&auto=format&fit=crop";
  }
};

/**
 * SECURITY SANDBOX: Validates that the generated HTML does not contain 
 * harmful elements like scripts, iframes, or malicious event handlers.
 */
export const isHtmlSafe = (html: string): { safe: boolean; reason?: string } => {
    // 1. Check for <script> tags
    if (/<script/i.test(html)) return { safe: false, reason: "Contains <script> tags" };

    // ALLOW: [CHART] and [IMAGE] placeholders
    const sanitizedHtml = html.replace(/\[CHART\]|\[IMAGE\]/g, "");

    // 2. Check for on* event handlers (e.g., onclick, onload)
    if (/\son\w+\s*=/i.test(sanitizedHtml)) return { safe: false, reason: "Contains event handlers (on*)" };

    // 3. Check for dangerous tags
    const dangerousTags = ['iframe', 'embed', 'object', 'form', 'base', 'link', 'meta'];
    for (const tag of dangerousTags) {
        const regex = new RegExp(`<${tag}`, 'i');
        if (regex.test(html)) return { safe: false, reason: `Contains forbidden tag: <${tag}>` };
    }

    // 4. Check for data: or javascript: URIs in src or href
    if (/href\s*=\s*["']\s*(javascript|data):/i.test(html)) return { safe: false, reason: "Contains javascript: or data: URIs" };
    if (/src\s*=\s*["']\s*(javascript|data):/i.test(html) && !/src\s*=\s*["']\s*data:image/i.test(html)) {
        // Allow data:image for base64 images if needed, but otherwise block data:
        return { safe: false, reason: "Contains dangerous data: URIs" };
    }

    return { safe: true };
};

const aiDesignSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    slides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          contentHtml: { 
            type: "string", 
            description: "Full HTML for a 1920x1080 canvas using Tailwind. Start with <div class='w-[1920px] h-[1080px] border-[16px] relative ...'>" 
          },
          imageKeyword: { type: "string", description: "Search term for a real photo. MUST BE IN ENGLISH ONLY. MUST be highly specific to the exact slide content (e.g., 'holi powder' not 'festival')." },
          chart: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["bar", "line", "pie", "roadmap"] },
              data: {
                type: "object",
                properties: {
                  labels: { type: "array", items: { type: "string" } },
                  values: { type: "array", items: { type: "number" } },
                  milestones: { type: "array", items: { type: "string" } }
                }
              }
            }
          },
          pptxData: {
            type: "object",
            properties: {
                title: { type: "string" },
                points: { type: "array", items: { type: "string" } },
                layout: { type: "string", enum: ["title", "hero", "grid", "stats", "image-text"] },
                alignment: { type: "string", enum: ["left", "center", "right"] },
                backgroundColor: { type: "string", description: "HEX code" },
                textColor: { type: "string", description: "HEX code" },
                accentColor: { type: "string", description: "HEX code" }
            },
            required: ["title", "points", "layout", "backgroundColor", "textColor"]
          }
        },
        required: ["title", "contentHtml", "pptxData"]
      }
    }
  },
  required: ["title", "slides"]
};

export const generatePresentation = async (topic: string, slideCount: number, theme: string, quantify: boolean = false, language: string = "English", pdfContent?: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `
    ${pdfContent ? `CONTEXT FROM UPLOADED PDF:\n${pdfContent}\n\n` : ""}
    Generate a presentation about "${topic}" with ${slideCount} slides.
    ${pdfContent ? "Use the provided PDF context as the primary source of information. If the topic is broad, focus on the most relevant parts of the PDF." : ""}
    Theme: ${theme}.
    Language: ${language}. The entire presentation MUST be written in ${language}.
    ${quantify ? "Include data-driven insights. For at least 2 slides, include a 'chart' object with { type: 'bar' | 'line' | 'pie' | 'roadmap', data: { labels: string[], values: number[] } } (or { milestones: string[] } for roadmap)." : ""}
    Return a JSON object with this structure:
    {
      "title": "Presentation Title",
      "slides": [
        {
          "title": "Slide Title",
          "content": ["Point 1", "Point 2"],
          "speakerNotes": "Notes for the presenter",
          "imageKeyword": "Search term for background. MUST BE English and highly specific to this exact slide (e.g., 'holi powder', NOT generic 'indian festival'). Never repeat keywords.",
          "layout": "title" | "content" | "image-text",
          "chart": optional chart object if relevant
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
  const text = response.text();
  const cleanJson = text.replace(/```json|```/g, "").trim();
  const data = JSON.parse(cleanJson);

  const slidesWithImages = await Promise.all(data.slides.map(async (slide: any) => {
    if (slide.imageKeyword) {
      const imageUrl = await fetchImage(slide.imageKeyword);
      return { ...slide, backgroundImage: imageUrl };
    }
    return slide;
  }));

  return { ...data, slides: slidesWithImages, tokensUsed };
};

export const generateAIDesignedPresentation = async (topic: string, slideCount: number, theme: string, aiStyle: "creative" | "professional" = "creative", language: string = "English", pdfContent?: string, quantify: boolean = false) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.8
    }
  });

  const CREATIVE_BLUEPRINT = `
  <div class="w-[1920px] h-[1080px] bg-slate-900 text-white relative overflow-hidden flex">
    <!-- Image Section: Beautiful edge-to-edge half-screen -->
    <div class="w-[45%] h-full relative z-10">
      <img src="[IMAGE]" class="w-full h-full object-cover shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-10 relative" />
      <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-20 pointer-events-none"></div>
    </div>
    
    <!-- Typography & Content Side (Magazine Editorial) -->
    <div class="w-[55%] h-full flex flex-col justify-center px-32 z-20 bg-slate-950/80 backdrop-blur-3xl">
       <!-- Font Mixing & Highlighting -->
       <h2 class="font-['Playfair_Display'] italic text-5xl text-rose-400 mb-8">The Art of</h2>
       <h1 class="font-['Montserrat'] font-black text-[8.5rem] leading-[0.9] mb-12 tracking-tighter">
         Creative <br/>
         <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">Brilliance</span>
       </h1>
       
       <p class="font-['Inter'] text-4xl opacity-80 font-light leading-relaxed mb-16">
         True creativity is not about chaos. It is about <span class="bg-yellow-400 text-slate-900 font-medium px-2 shadow-sm rounded-sm">highlighting what matters</span> and using framing to tell a compelling story.
       </p>
       
       <div class="flex items-center gap-8">
          <div class="w-24 h-2 bg-rose-500 rounded-full"></div>
          <div class="font-['Montserrat'] font-bold tracking-[0.4em] uppercase text-rose-500 text-2xl">Visual Mastery</div>
       </div>
    </div>
  </div>`;

  const PROFESSIONAL_BLUEPRINT = `
  <div class="w-[1920px] h-[1080px] bg-[#f8fafc] relative overflow-hidden font-['Inter'] text-slate-800 p-32 flex flex-col justify-center">
    <!-- Clean Structural Sidebar -->
    <div class="absolute left-0 top-0 w-8 h-full bg-slate-800 z-20"></div>
    
    <div class="z-20 w-full max-w-7xl mx-auto">
       <div class="flex items-end justify-between border-b-4 border-slate-800 pb-12 mb-16">
           <div>
               <h2 class="text-3xl font-bold tracking-[0.3em] text-cyan-700 uppercase mb-6">Q3 Analysis</h2>
               <h1 class="font-['Montserrat'] font-black text-8xl text-slate-900 tracking-tight">Market Penetration</h1>
           </div>
           <div class="text-right">
               <div class="text-8xl font-black text-slate-800">84%</div>
               <div class="text-2xl text-slate-500 font-medium uppercase tracking-widest mt-4">YoY Growth</div>
           </div>
       </div>
       
       <!-- Multi-column structure -->
       <div class="grid grid-cols-2 gap-24 items-center">
           <div class="text-4xl text-slate-600 leading-relaxed font-light">
              The strategic realignments executed in Q2 have yielded unprecedented operational efficiency across all verticals. We maintain aggressive targets.
           </div>
           <div class="h-[400px] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200">
              <img src="[IMAGE]" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
           </div>
       </div>
    </div>
  </div>`;

  const CREATIVE_PROMPT = `
        STYLE: HIGHLY VERSATILE, DIVERSE & IN RESPONSE TO THE THEME: "${theme.toUpperCase()}".
        You are an award-winning versatile art director capable of rapidly switching styles. You MUST invent a stunning, elegant color palette and design explicitly matching the requested theme ("${theme}").
        - EXTREME CONTRAST (CRITICAL): You MUST follow the GUARANTEED TEXT CONTRAST rules carefully. Pick either a Dark Theme (slate-900 bg with white text) or a Light Theme (white bg with slate-900 text) for each slide. Do not mix them accidentally.
        - LAYOUT VARIETY: Do NOT make every slide a magazine split. Make one slide a massive centered bold text, another an asymmetric grid, another a floating glass card, etc. Draw inspiration from layouts like: "Swiss Style (bold asymmetric grids)", "Playful (soft pastels, rounded)", "Abstract (geometric, wild)", or "Retro (warm, nostalgic)".
        - IMAGE FRAMING: Use edge-to-edge images, dynamic crops, or stunning split-screens.
        
        STRUCTURAL BLUEPRINT (Use this as a QUALITY metric for how layered your HTML should be, but ABSOLUTELY INVENT YOUR OWN CONTENT, HIGHLIGHTS, COLORS, AND DRASTICALLY DIFFERENT LAYOUTS FOR EACH SLIDE!):
        ${CREATIVE_BLUEPRINT}
  `;

  const PROFESSIONAL_PROMPT = `
        STYLE: MCKINSEY-LEVEL CORPORATE & STRUCTURED IN RESPONSE TO THEME: "${theme.toUpperCase()}".
        You are a senior executive designer. You MUST invent a sophisticated, high-contrast, professional color palette based on the topic and the requested theme: "${theme}".
        - EXTREME CONTRAST (CRITICAL): You MUST follow the GUARANTEED TEXT CONTRAST rules carefully. Pick either a Dark Box (bg-slate-900 with text-white) or a Light Box (bg-white with text-slate-900). Do not mix them accidentally.
        DO NOT default to basic colors. Use rich dark themes (deep slate, rich charcoal) with bold accents (gold, emerald, crisp white), or ultra-clean light themes with deep, strong typography.
        Use pristine grid systems, clear visual hierarchy, sophisticated whitespace, and structured information cards.
        
        STRUCTURAL BLUEPRINT (Use this as a QUALITY metric for how structured and clean your HTML should be, but INVENT YOUR OWN SPECIFIC LAYOUTS!):
        ${PROFESSIONAL_BLUEPRINT}
  `;

  const STYLE_INSTRUCTION = aiStyle === "creative" ? CREATIVE_PROMPT : PROFESSIONAL_PROMPT;

    const prompt = `
        ${pdfContent ? `CONTEXT FROM UPLOADED PDF:\n${pdfContent}\n\n` : ""}
        Generate a ${slideCount}-slide presentation about "${topic}".
        ${pdfContent ? "Use the provided PDF context as the primary source of information. Focus on the core message and data from the PDF." : ""}
        ${quantify ? "Include data-driven insights. For at least 2 slides, include a 'chart' object in the slide data (type: bar | line | pie | roadmap). Ensure the chart data is realistic and relevant to the slide topic." : ""}
        Mode: AI-Designer Mode (Custom HTML).
        LANGUAGE: ${language}. All visible text (headings, body, lists) MUST be written perfectly in ${language}.
        
        ${STYLE_INSTRUCTION}
        
        For each slide, you MUST generate a "contentHtml" property containing a beautiful, modern, high-end design using ONLY Tailwind CSS classes.
        
        STRICT DESIGN RULES (AGENCY-GRADE):
        1. CANVAS & BORDERS: Fixed 1920x1080 (16:9). The root <div> MUST have a visible, thick outer border (e.g., 'border-[16px] border-slate-900', 'border-[24px] border-[color]'). EVERY SINGLE SLIDE MUST HAVE THIS OUTER BORDER.
        2. PERFECT COLOR COHESION: You MUST invent exactly 2-3 core colors (e.g., 'slate-900', 'rose-800', 'amber-100') for the ENTIRE presentation. EVERY SINGLE SLIDE MUST reuse these exact same 2-3 background and accent colors. DO NOT introduce random new colors (like neon yellow) on later slides. The presentation MUST look like a single unified brand. Include background accent blobs or shapes on layer \`z-0\`.
        3. IMAGE & CHART CONTAINERS (\`[IMAGE]\` / \`[CHART]\`): 
           - CRITICAL: Every \`img\` parent box MUST have \`overflow-hidden\`.
           - If using a photo, wrap the EXACT string \`<img src="[IMAGE]" class="w-full h-full object-cover">\` in a \`div\` with \`rounded-[2.5rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden\`.
           - If using a chart, wrap the EXACT string \`<img src="[CHART]" class="w-full h-full object-contain">\` in a custom \`div\` container with \`overflow-hidden\`. Charts MUST use \`object-contain\` to avoid clipping data.
           - Ensure containers for \`[CHART]\` are large enough (at least 50% width or height) and have internal padding to keep them away from slide borders.
        4. GUARANTEED TEXT CONTRAST (FAILING THIS RUINS THE PRESENTATION): 
           - RULE A: If your container background is DARK (e.g. bg-slate-900, bg-indigo-950, bg-black), EVERY text element inside MUST use 'text-white' or 'text-slate-50'.
           - RULE B: If your container background is LIGHT (e.g. bg-white, bg-slate-50, bg-rose-50), EVERY text element inside MUST use 'text-slate-900' or 'text-black'.
           - DO NOT MIX: Pick ONE overarching mode for a block of text (DARK BOX or LIGHT BOX) and strictly stick to it. Do not use colorful text that blends into the background.
           - Text MUST be on Layer \`z-20\`. Background decorations MUST be \`z-0\`.
           - You MUST manually check every single <h1/h2/p> tag in your output before finishing to ensure it strictly follows Rule A or Rule B.
        5. TYPOGRAPHY: Headlines: 'Montserrat, sans-serif' (Weights 800/900). Body: 'Inter, sans-serif' (50-80 words per slide).
        6. BORDER PADDING: If you draw a border or background box around ANY text, you MUST add generous internal padding (e.g., 'p-8', 'p-12') so the text never touches the edges. Leave at least a 1cm visual gap.
        7. TEXT COLOR INHERITANCE (CRITICAL FOR CONTRAST): Do NOT add 'text-[color]' utility classes to every single <h1> or <p> tag. Instead, set ONE overarching text color on the parent container (e.g., <div class="bg-slate-900 text-white">) and let the children inherit it smoothly. Use 'opacity-80' or 'opacity-60' for secondary text to avoid messing up contrast combinations.
        8. IMAGE SEARCH QUERIES: The 'imageKeyword' property MUST ALWAYS be in English, regardless of the presentation language. It MUST be a highly specific, unique subject for the exact slide (e.g. 'diwali fireworks' or 'holi powder', NEVER a generic repeating term like 'indian festivals'). Do not repeat keywords.
        9. OVERFLOW PREVENTION (CRITICAL): Text MUST NEVER overflow the 1920x1080 canvas or its bounding box. ALWAYS use 'break-words whitespace-normal' on text containers. NEVER use rigid fixed heights (e.g. 'h-[400px]') on text boxes; use 'min-h-[400px]' instead. If a translated heading is long, forcefully reduce the font size (e.g. use 'text-5xl' instead of 'text-9xl').
        
        *** CRITICAL INSTRUCTION FOR TEXT-ONLY SLIDES ***
        If a slide has NO image, you MUST physically fill the expansive 1920x1080 canvas so it DOES NOT look empty.
        - DO NOT just center a tiny paragraph.
        - USE 2-column or 3-column text grids (\`grid grid-cols-2 gap-16\`).
        - USE massive typographical blockquotes (\`text-6xl italic\`) spanning the screen.
        - USE giant statistic numbers (\`text-9xl\`) next to explanatory text.
        - Generate MORE TEXT (80-120 words) for these slides to ensure they feel rich and complete.
        
        PRESCRIBED LAYOUT PATTERNS (VARY THESE):
        - THE MODERN SPLIT: Vertical 50/50 split using Flex. One side high-res photo, other side deep insight text glassmorphism card.
        - THE BOLD GRID: 3-column asymmetric grid. Each point in its own rounded box.
        - THE CENTERED HERO: Massive headline centered via \`flex items-center justify-center\` on the root.

        OUTPUT: Provide detailed "pptxData" mapping to your chosen HTML style exactly (colors/layout).
        Output valid JSON matching this schema:
        ${JSON.stringify(aiDesignSchema, null, 2)}
      `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
  const text = response.text().replace(/```json|```/g, "").trim();
  const data = JSON.parse(text);

  const slidesWithImages = await Promise.all(data.slides.map(async (slide: any) => {
      // SECURITY CHECK: Validate HTML before processing
      const securityCheck = isHtmlSafe(slide.contentHtml);
      if (!securityCheck.safe) {
          console.error(`Security violation in generated slide: ${securityCheck.reason}`);
          // Neutralize the slide or throw error
          slide.contentHtml = `<div class="w-[1920px] h-[1080px] bg-red-50 flex items-center justify-center text-red-600 font-bold border-[16px] border-red-200">
              <div class="text-center">
                  <h1 class="text-6xl mb-4">Security Warning</h1>
                  <p class="text-2xl opacity-70">This slide was blocked by the Sandbox due to suspicious content.</p>
                  <p class="text-lg mt-2 font-mono opacity-50">Reason: ${securityCheck.reason}</p>
              </div>
          </div>`;
      }

      if (slide.imageKeyword) {
          try {
              const imageUrl = await fetchImage(slide.imageKeyword);
              let finalHtml = slide.contentHtml;
              finalHtml = finalHtml.replace(/\[IMAGE\]|\{\{\s*IMAGE_URL\s*\}\}/g, imageUrl);
              return { ...slide, contentHtml: finalHtml, backgroundImage: imageUrl };
          } catch (e) {
              return { ...slide, backgroundImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop" };
          }
      }
      return slide;
  }));

  return { ...data, slides: slidesWithImages, theme, isAiDesigned: true, tokensUsed };
};
