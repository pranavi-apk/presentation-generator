

export type LayoutId = "default" | "swiss" | "editorial" | "playful" | "abstract" | "retro";


export interface Template {
  id: LayoutId;
  name: string;
  description: string;
  thumbnail: string; // Placeholder for now
}

export const templates: Template[] = [
  {
    id: "default",
    name: "Standard",
    description: "Classic robust layout suitable for most presentations.",
    thumbnail: "standard",
  },
  {
    id: "swiss",
    name: "Swiss Style",
    description: "Bold typography, asymmetric grids, high contrast.",
    thumbnail: "swiss",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Image-forward, magazine style layouts with overlay text.",
    thumbnail: "editorial",
  },
  {
    id: "playful",
    name: "Playful",
    description: "A fun, friendly aesthetic with soft pastels and rounded shapes.",
    thumbnail: "playful",
  },
  {
    id: "abstract",
    name: "Abstract",
    description: "Bold geometric shapes and artistic composition.",
    thumbnail: "abstract",
  },
  {
    id: "retro",
    name: "Retro",
    description: "Warm, nostalgic vibes with vintage typography.",
    thumbnail: "retro",
  },
];

