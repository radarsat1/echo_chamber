
import { GoogleGenAI } from "@google/genai";
import { Comment } from '../types';

// IMPORTANT: This key is managed by the environment and should not be hardcoded.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const summarizeCommentsWithGemini = async (comments: Comment[], articleTitle: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  
  if (comments.length === 0) {
    return "There are no comments to summarize.";
  }

  const model = "gemini-2.5-flash";

  const commentsText = comments
    .map(c => `Comment from ${c.author}:\n${new DOMParser().parseFromString(c.body, 'text/html').documentElement.textContent}`)
    .join('\n\n---\n\n');

  const prompt = `
    The following is a collection of comments from an online discussion about the article titled: "${articleTitle}".

    Please provide a concise, neutral summary of the discussion. Your summary should identify the main points of agreement, key disagreements, and any interesting or unique perspectives raised by the commenters. Do not invent information. Base your summary strictly on the comments provided below.

    Here are the comments:
    ---
    ${commentsText}
    ---
    End of comments. Please provide the summary.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.3,
        topP: 0.9,
        topK: 20,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a more user-friendly error message
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The configured API key is invalid. Please check your environment setup.");
    }
    throw new Error("The AI model could not generate a summary. Please try again later.");
  }
};
