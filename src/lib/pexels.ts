const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const fetchImage = async (query: string): Promise<string> => {
  if (!PEXELS_API_KEY) {
    console.error("Pexels API Key is missing");
    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop"; // Fallback
  }

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch image from Pexels");
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large;
    }
    
    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop"; // Fallback if no results
  } catch (error) {
    console.error("Error fetching image:", error);
    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop";
  }
};
