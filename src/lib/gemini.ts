import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchImage } from "./pexels";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Schema for slide generation
const slideSchema = {
  description: "A presentation slide deck",
  type: "object",
  properties: {
    title: { type: "string", description: "Title of the presentation" },
    theme: { 
        type: "string", 
        enum: ["modern", "dark", "nature", "professional", "cyberpunk"],
        description: "The visual theme of the presentation based on the topic." 
    },
    slides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          layout: { 
            type: "string", 
            enum: ["title", "content", "image-text", "tableOfContents"],
            description: "Layout type of the slide" 
          },
          title: { type: "string", description: "Title of the slide" },
          content: { 
            type: "array", 
            items: { type: "string" },
            description: "Bullet points or text content" 
          },
          imageKeyword: { 
            type: "string", 
            description: "A valid Pexels search keyword to find an image for this slide (if layout is image-text)." 
          },
          speakerNotes: { type: "string", description: "Notes for the presenter" },
          chart: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["bar", "pie", "roadmap"] },
              data: {
                type: "object",
                properties: {
                  labels: { type: "array", items: { type: "string" } },
                  values: { type: "array", items: { type: "number" } },
                  milestones: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        date: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["layout", "title", "content", "speakerNotes"]
      }
    }
  },
  required: ["title", "theme", "slides"]
};

export const generatePresentation = async (topic: string, slideCount: number = 8, theme?: string, quantify: boolean = false) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Create a professional presentation about: "${topic}".
      Generate exactly ${slideCount} slides.
      The first slide MUST be a "title" slide.
      Include a "tableOfContents" slide early on.
      Includes a mix of "content" slides and "image-text" slides.
      
      ${quantify ? `
      CRITICAL: You MUST include at least 2 data-driven slides with a "chart" property.
      - Use "bar" or "pie" for statistical data (require "labels" and "values").
      - Use "roadmap" for timelines (require "milestones" with "label" and "date").
      ` : ''}

      For "image-text" slides, provide a SINGLE search keyword for Pexels in "imageKeyword".
      
      ${theme && theme !== 'auto' && theme !== 'none' ? `Use the "${theme}" theme style for content.` : 'Select a theme that fits the mood of the topic.'}
      
      Output valid JSON matching this schema:
      ${JSON.stringify(slideSchema, null, 2)}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown code blocks
    const jsonString = text.replace(/```json\n|\n```/g, "").trim();
    const data = JSON.parse(jsonString);

    // Fetch images for slides that need them
    const slidesWithImages = await Promise.all(data.slides.map(async (slide: any) => {
        if (slide.layout === "image-text" || slide.backgroundImage) {
            const keyword = slide.imageKeyword || slide.title || topic;
            try {
                const imageUrl = await fetchImage(keyword);
                return { ...slide, backgroundImage: imageUrl };
            } catch (e) {
                return { ...slide, backgroundImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop" };
            }
        }
        return slide;
    }));

    return { 
        ...data, 
        slides: slidesWithImages,
        theme: theme && theme !== 'auto' && theme !== 'none' ? theme : data.theme 
    };

  } catch (error) {
    console.error("Error generating presentation:", error);
    throw error;
  }
};

