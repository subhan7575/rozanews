import { GoogleGenAI, Type } from "@google/genai";
import { Article } from "../types";
import { StorageService } from "./storageService";

// Helper to get a fresh AI client using the latest saved key
const getAIClient = () => {
  const apiKey = StorageService.getApiKey();
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  /**
   * Generates a high-quality, journalistic news article.
   */
  generateArticle: async (topic: string, category: string): Promise<Partial<Article>> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    const prompt = `
    You are an expert SEO Specialist and Senior Editor for 'Roza News', a prestigious international news organization.
    
    TASK: Write a breaking news article about "${topic}" for the "${category}" section.

    SEO GUIDELINES:
    1. **Title**: Must be click-worthy, contain the main keyword, and be under 60 characters if possible.
    2. **Tags**: Generate 5-8 HIGH TRAFFIC keywords (e.g. "Breaking News", "Latest Updates", specific names).
    
    CONTENT GUIDELINES:
    1. **Tone**: Professional, objective, authoritative (Associated Press style).
    2. **Structure**: 
       - Strong Lead Paragraph (Who, what, where, when, why).
       - Detailed Body (300-500 words) using Markdown (headings, bold key terms).
    3. **Image**: Suggest a highly specific image search query for this topic.
    4. **Hidden Identity**: NEVER mention you are an AI. Write as "Subhan Ahmad".

    Output JSON format only.
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

      // Auto-generate a SEO slug from the AI title immediately
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
        // We use the search query to simulate fetching an image
        imageUrl: `https://picsum.photos/seed/${data.imageSearchQuery.replace(/\s/g, '').substring(0, 10)}/800/600`,
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
     const ai = getAIClient();
     try {
       const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: `Act as a Copy Editor. Fix grammar, improve flow, remove passive voice, and make the following text sound like top-tier journalism. Keep markdown formatting.\n\n${content}`
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
        5. Ensure strict TypeScript safety and fix any potential bugs you see.
        6. If the instruction is vague, implement the industry standard best practice.
        
        INPUT CODE:
        ${code}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      let text = response.text || code;
      
      // Strict Cleanup to ensure no markdown leaks into the editor
      text = text.replace(/^```(typescript|javascript|tsx|ts|css|json)?/g, '').replace(/```$/g, '');
      
      return text.trim();
    } catch (e) {
      console.error("Gemini Code Edit Error:", e);
      throw e;
    }
  }
};