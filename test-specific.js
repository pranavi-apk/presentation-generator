import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testSpecificModel() {
  // Found "models/gemini-1.5-flash-8b" in the list!
  // Also "models/gemini-2.0-flash-exp" is there. User asked for "Gemini 3 Pro" initially which doesn't exist publicly yet in that form,
  // but they have access to "gemini-2.0-flash-exp" and "gemini-1.5-flash-8b".
  
  // Let's try the most stable-looking one that is close to flash: "gemini-1.5-flash-8b"
  // Or "gemini-2.0-flash-exp" which is newer.
  
  const modelName = "gemini-2.5-flash"; 
  
  console.log(`Testing ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log(`✅ ${modelName} SUCCESS!`);
    console.log("Response:", response.text());
  } catch (error) {
    console.error(`❌ ${modelName} Failed:`, error.message);
  }
}

testSpecificModel();
