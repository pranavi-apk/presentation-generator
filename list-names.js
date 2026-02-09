import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function listModelNames() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
        console.log("--- Available Models ---");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(m.name.replace("models/", ""));
            }
        });
        console.log("------------------------");
    } else {
        console.log("No models found or error:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModelNames();
