import { GoogleGenAI, Type } from "@google/genai";
import { Article } from "../types";

// NOTE: In a production environment, this key should be hidden on the backend.
// Using the provided key for this specific deployment as requested.
const API_KEY = "AIzaSyB-EtwPh9Lih-coyY-fXyCNOlpsKcBm4Sw";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const GeminiService = {
  /**
   * Generates a full news article based on a topic/headline.
   */
  generateArticle: async (topic: string, category: string): Promise<Partial<Article>> => {
    const model = "gemini-2.5-flash";
    const prompt = `Write a professional news article about "${topic}" in the category of "${category}".
    It must be factual, journalistic tone (like BBC or Reuters), and objective.
    Include a catchy headline, a short summary, full body content (in Markdown), 5 relevant tags, and a suggested image search query.
    DO NOT mention that this is AI generated.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              tags: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              imageSearchQuery: { type: Type.STRING }
            },
            required: ["title", "summary", "content", "tags", "imageSearchQuery"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const data = JSON.parse(text);

      return {
        title: data.title,
        summary: data.summary,
        content: data.content,
        tags: data.tags,
        // We use the search query to simulate fetching an image
        imageUrl: `https://picsum.photos/seed/${data.imageSearchQuery.replace(/\s/g, '')}/800/600`,
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
   */
  improveContent: async (content: string): Promise<string> => {
     try {
       const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: `Fix grammar, improve flow, and make the following text sound more professional journalistic. Keep markdown formatting.\n\n${content}`
       });
       return response.text || content;
     } catch (e) {
       console.error(e);
       return content;
     }
  },

  /**
   * Modifies source code based on admin commands.
   */
  editCode: async (code: string, instruction: string): Promise<string> => {
    try {
      const prompt = `
        You are an expert React/TypeScript developer for the "Roza News" project.
        Your task is to modify the following code based on this instruction: "${instruction}".
        
        RULES:
        1. Return ONLY the full updated code.
        2. Do not wrap in markdown code blocks.
        3. Do not add explanations.
        4. Maintain existing functionality unless asked to change it.
        5. Ensure the code is valid TypeScript/React.
        
        CODE:
        ${code}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      let text = response.text || code;
      
      // Cleanup if AI adds markdown blocks despite instructions
      text = text.replace(/^```(typescript|javascript|tsx|ts)?/, '').replace(/```$/, '');
      
      return text.trim();
    } catch (e) {
      console.error("Gemini Code Edit Error:", e);
      throw e;
    }
  }
};
