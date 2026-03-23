const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

export const fetchImage = async (query: string): Promise<string> => {
  if (!PIXABAY_API_KEY) {
    console.error("Pixabay API Key is missing");
    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop"; // Fallback
  }

  try {
    // Search for all image types (photos, illustrations, vectors)
    const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=all&orientation=horizontal&safesearch=true&per_page=3`);

    if (!response.ok) {
        throw new Error("Failed to fetch image from Pixabay");
    }

    const data = await response.json();
    if (data.hits && data.hits.length > 0) {
      return data.hits[0].largeImageURL;
    }
    
    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop"; // Fallback if no results
  } catch (error) {
    console.error("Error fetching image:", error);
    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop";
  }
};
