import dotenv from 'dotenv';
dotenv.config();

const PEXELS_API_KEY = process.env.VITE_PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.error("Missing Pexels API Key");
  process.exit(1);
}

async function testPexels() {
  const query = "nature";
  console.log(`Testing Pexels API with query: "${query}"...`);
  
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!response.ok) {
        console.error(`Pexels API Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error("Response:", text);
        return;
    }

    const data = await response.json();
    console.log("Success!");
    if (data.photos && data.photos.length > 0) {
        console.log("Found Photo:", data.photos[0].src.large);
    } else {
        console.log("No photos found for query.");
    }
    
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testPexels();
