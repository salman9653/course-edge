require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    console.log("Error: Please set a valid GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
    return;
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
       console.error("API Error:", data.error.message);
       return;
    }
    console.log("Available models for this API key:");
    data.models.forEach(m => console.log(`- ${m.name}`));
  } catch (error) {
    console.error("Fetch error:", error.message);
  }
}

listModels();
