import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AIDork {
  label: string;
  description: string;
  query: string;
  tags: string[];
}

export async function generateAdvancedDorks(params: {
  firstName: string;
  lastName: string;
  username: string;
  location: string;
  business: string;
  role: string;
}): Promise<AIDork[]> {
  const { firstName, lastName, username, location, business, role } = params;
  
  if (!firstName && !lastName && !username && !business) {
    throw new Error("Insufficient target data for AI generation.");
  }

  const prompt = `
    As an expert OSINT and SOCMINT investigator, generate a list of 6 highly advanced and specific Google Dorks for the following target:
    - First Name: ${firstName || 'N/A'}
    - Last Name: ${lastName || 'N/A'}
    - Username/Alias: ${username || 'N/A'}
    - Location: ${location || 'N/A'}
    - Business/Organization: ${business || 'N/A'}
    - Role/Position: ${role || 'N/A'}

    The dorks should focus on high-value data leaks, obscure social profiles, archived technical data, and professional footprints.
    Avoid basic dorks. Think about cross-platform pivoting, specific document types (xlsx, docx, pdf), and hidden deep-web indexes.
    
    Structure the response as a JSON array of objects with 'label', 'description', 'query', and 'tags'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "Short descriptive name of the dork" },
              description: { type: Type.STRING, description: "Explanation of what this dork aims to find" },
              query: { type: Type.STRING, description: "The actual Google search query with target parameters injected" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant OSINT tags" },
            },
            required: ["label", "description", "query", "tags"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
