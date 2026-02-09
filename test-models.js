import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    // There isn't a direct listModels method on the client instance in some versions,
    // but let's try to fetch a known public model info or list models via fetch directly if needed.
    // However, the error message clearly says "Call ListModels to see the list of available models".
    // This implies the key MIGHT have access to *some* models, just not the ones we tried.
    // Let's try to use the `getGenerativeModel` with a very basic model.
    
    console.log("Attempting to list models using a different approach...");
    // Let's try 'gemini-pro' again but with a simple prompt, ensuring no fancy config.
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Test");
        console.log("gemini-pro works!");
        console.log(result.response.text());
    } catch (e) {
        console.log("gemini-pro failed: " + e.message.split('\n')[0]);
    }

    try {
        // Try even an older one if available? user doesn't have paLM access probably.
        // What about 'gemini-1.0-pro-latest'?
         const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });
         await model.generateContent("Test");
         console.log("gemini-1.0-pro-latest works!");
    } catch (e) {
        console.log("gemini-1.0-pro-latest failed: " + e.message.split('\n')[0]);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
