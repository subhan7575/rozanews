import { GoogleGenAI, Type } from "@google/genai";
import { Article, WeatherData } from "../types";
import { StorageService } from "./storageService";

// Helper to get a fresh AI client using the latest saved key
const getAIClient = () => {
  const apiKey = StorageService.getApiKey();
  return new GoogleGenAI({ apiKey });
};

// --- ROBUST JSON CLEANER ---
// AI often returns markdown code blocks (```json ... ```). This strips them.
const cleanAIResponse = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```json/gi, "").replace(/^```/gi, "").replace(/```$/gi, "");
  return cleaned.trim();
};

export const GeminiService = {
  /**
   * Generates a high-quality, journalistic news article.
   */
  generateArticle: async (topic: string, category: string): Promise<Partial<Article>> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    const prompt = `
    You are an expert Senior Editor for 'Roza News'.
    
    TASK: Write a breaking news article about "${topic}" for the "${category}" section.

    REQUIREMENTS:
    1. **Title**: Catchy, SEO-optimized, < 70 chars.
    2. **Content**: Professional AP Style. 300+ words. Use Markdown (## headings, **bold**).
    3. **Tags**: 5-8 relevant keywords.
    4. **Image Query**: A precise English search term to find a photo of this event (e.g. "SpaceX rocket launch sunset").

    OUTPUT: Strictly valid JSON. No conversational text.
    Format:
    {
      "title": "...",
      "summary": "...",
      "content": "...",
      "tags": ["..."],
      "imageSearchQuery": "..."
    }
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const cleanedText = cleanAIResponse(text);
      const data = JSON.parse(cleanedText);

      // Auto-generate a SEO slug
      const seoSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);

      return {
        title: data.title,
        slug: seoSlug,
        summary: data.summary,
        content: data.content,
        tags: data.tags,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(data.imageSearchQuery.substring(0, 10))}/800/600`,
        publishedAt: new Date().toISOString(),
        views: 0,
        author: 'Subhan Ahmad',
        isBreaking: false,
        isFeatured: false,
      };

    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  },

  /**
   * Improves existing content (Editor Assistant)
   * Mode: 'grammar' | 'rewrite' | 'shorten'
   */
  improveContent: async (content: string, mode: 'grammar' | 'rewrite' = 'grammar'): Promise<string> => {
     const ai = getAIClient();
     let instruction = "";
     
     if (mode === 'grammar') {
        instruction = "Fix grammar, spelling, and punctuation errors. Keep the tone professional. Do not change the meaning. Return ONLY the corrected text.";
     } else {
        instruction = "Rewrite this content to be more engaging, punchy, and journalistic. Use active voice. Return ONLY the rewritten text.";
     }

     try {
       const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: `${instruction}\n\nINPUT TEXT:\n${content}`
       });
       return cleanAIResponse(response.text || content);
     } catch (e) {
       console.error(e);
       return content;
     }
  },

  /**
   * Generates tags based on content
   */
  generateTags: async (content: string): Promise<string[]> => {
    const ai = getAIClient();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following text and generate 5-8 relevant, high-traffic SEO tags/keywords. Return valid JSON array of strings only. Example: ["Tech", "AI"].\n\nTEXT: ${content.substring(0, 1000)}`,
        config: { responseMimeType: "application/json" }
      });
      const text = cleanAIResponse(response.text || "[]");
      return JSON.parse(text);
    } catch (e) {
      return ["News", "Latest"];
    }
  },

  /**
   * Generates a smart weather insight/summary based on data.
   */
  generateWeatherInsight: async (weatherData: WeatherData): Promise<string> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Act as a friendly, witty weather presenter.
      
      Current Conditions in ${weatherData.city}:
      - Temp: ${weatherData.temp}°C
      - Condition: ${weatherData.condition}
      - Wind: ${weatherData.windSpeed} km/h
      - UV Index: ${weatherData.uvIndex}
      
      Task: Write a 1-sentence "Outfit Advice" or "Activity Recommendation".
      Example: "It's scorching today, so grab those sunglasses and stay hydrated!"
      Keep it under 20 words.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt
      });
      return response.text?.trim() || `Enjoy the ${weatherData.condition} weather in ${weatherData.city}!`;
    } catch (e) {
      return `Enjoy the ${weatherData.condition} weather in ${weatherData.city}!`;
    }
  },

  /**
   * Modifies source code based on admin commands.
   */
  editCode: async (code: string, instruction: string): Promise<string> => {
    const ai = getAIClient();
    try {
      const prompt = `
        You are an expert Senior React/TypeScript Software Engineer.
        Your task is to refactor or modify the provided code based on this instruction: "${instruction}".
        
        RULES:
        1. Return ONLY the full updated code string. 
        2. Do not wrap in markdown code blocks (no \`\`\`).
        3. Do not add explanations or conversational text.
        4. Maintain all existing functionality unless explicitly asked to remove it.
        
        INPUT CODE:
        ${code}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      let text = response.text || code;
      text = cleanAIResponse(text); // Use the new cleaner
      return text.trim();
    } catch (e) {
      console.error("Gemini Code Edit Error:", e);
      throw e;
    }
  }
};