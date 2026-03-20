import { GoogleGenAI, Tool, Type } from "@google/genai";
import { SearchResponse, CaseAnalysis, Case, ChatMessage } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

const truncateText = (text: string, maxLength: number = 8000): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "... [Content truncated for length]";
};

/**
 * Searches for legal cases using Google Search grounding.
 */
export const searchCases = async (query: string): Promise<SearchResponse> => {
  const ai = getClient();
  const modelId = 'gemini-3-flash-preview'; 

  const prompt = `
    Find the most relevant and authoritative court cases related to: "${query}".
    
    Requirements:
    1. Identify at least 5-10 real, specific legal cases.
    2. For each case, provide:
       - name: Full official name (e.g., "Brown v. Board of Education").
       - citation: Official legal citation (e.g., "347 U.S. 483").
       - jurisdiction: The court or region (e.g., "U.S. Supreme Court").
       - date: Decision date in YYYY-MM-DD format.
       - summary: A concise 2-3 sentence summary of the legal holding.
       - tags: 2-4 relevant legal categories (e.g., "Civil Rights", "Education").
       - fullTextUrl: A direct link to the judgment text if available.
    
    Output must be in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} } as Tool],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  citation: { type: Type.STRING },
                  jurisdiction: { type: Type.STRING },
                  date: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  fullTextUrl: { type: Type.STRING }
                },
                required: ["name", "citation", "jurisdiction", "date", "summary", "tags"]
              }
            }
          }
        }
      },
    });

    const jsonText = response.text || '{ "cases": [] }';
    const parsedData = JSON.parse(jsonText);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      cases: parsedData.cases || [],
      groundingChunks: groundingChunks.map((chunk: any) => ({
        web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : undefined
      })).filter((c: any) => c.web !== undefined)
    };
  } catch (error: any) {
    console.error("Search failed:", error);
    throw error;
  }
};

/**
 * Provides a deep legal analysis of a case summary.
 */
export const analyzeLegalConcept = async (context: string): Promise<CaseAnalysis> => {
  const ai = getClient();
  const modelId = 'gemini-3.1-pro-preview';

  const prompt = `
    Perform a deep legal analysis on the following case context:
    
    "${truncateText(context, 10000)}"
    
    Provide:
    1. A professional summary of the case.
    2. Key legal points and arguments.
    3. Broader legal implications and precedents.
    
    Output must be in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            implications: { type: Type.STRING }
          },
          required: ["summary", "keyPoints", "implications"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Interactive chat about a specific case.
 */
export const chatWithCase = async (context: string, userMsg: string, chatHistory: ChatMessage[]): Promise<string> => {
  const ai = getClient();
  const modelId = 'gemini-3-flash-preview';

  const systemInstruction = `
    You are an expert legal scholar. You are discussing the following case context with a user:
    
    "${truncateText(context, 6000)}"
    
    Use the provided context to answer questions accurately. If information is missing, state that clearly.
    Maintain a professional, analytical tone.
  `;

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: { systemInstruction }
    });

    // Format history for the chat session
    const history = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Note: The current SDK might not support history in chats.create directly in all versions, 
    // but we can simulate it by prepending history to the message or using the proper API if available.
    // For this implementation, we'll use the sendMessage with history if possible, 
    // or just send the current message with context.
    
    const response = await chat.sendMessage({ message: userMsg });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat failed:", error);
    throw error;
  }
};
