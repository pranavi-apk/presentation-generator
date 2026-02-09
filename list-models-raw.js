import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key");
  process.exit(1);
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Error listing models: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error("Response body:", text);
        return;
    }
    
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

listModels();
