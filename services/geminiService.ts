import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Fetches live deadlines for a given list of scholarship names from a specific URL.
 * @param scholarshipNames - An array of scholarship titles to find deadlines for.
 * @returns A promise that resolves to a dictionary mapping scholarship names to their found deadlines.
 */
export const fetchLiveDeadlines = async (scholarshipNames: string[]): Promise<{ [key: string]: string }> => {
  if (scholarshipNames.length === 0) {
    return {};
  }

  const prompt = `
    You are a highly specialized data extraction agent. Your only task is to find the application deadlines for a specific list of scholarships from one single webpage.

    1.  **Target URL:** You must use the Google Search tool to access the content of this exact URL: 'https://scholarsworld.ng/scholarships/undergraduate-scholarships/'. Do not navigate to any other page.

    2.  **Scholarship List:** Here are the scholarships you need to find on that page:
        ${scholarshipNames.map(name => `- ${name}`).join('\n')}

    3.  **Extraction Task:** For each scholarship from the list that you can find on the page, extract ONLY its application deadline. The deadline is usually located near the title or in a summary table.

    4.  **Output Format:** You MUST return your findings as a single, clean JSON object.
        - The keys of the object must be the exact scholarship titles from the provided list.
        - The values must be the corresponding deadline strings you found.
        - If you cannot find a specific scholarship or its deadline on the page, simply omit it from your JSON response.
        - Do not include any other text, explanations, or markdown formatting. Your entire response must be only the JSON object.

    **Example Output:**
    {
      "NNPC/Total National Merit Scholarship": "July 2025",
      "SNEPCo National University Scholarship": "August 29, 2025"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let jsonString = response.text.trim();
    
    // Attempt to extract JSON from markdown code block or raw text
    const markdownMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      jsonString = markdownMatch[1];
    } else {
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }
    }

    if (!jsonString) {
        console.warn("No JSON content found in the deadline fetch response.");
        return {};
    }
    
    try {
        const result = JSON.parse(jsonString);
        return result || {};
    } catch (parseError) {
        console.error("Failed to parse deadline JSON response from API:", parseError);
        return {}; // Return empty object on failure
    }

  } catch (apiError) {
    console.error("Error fetching live deadlines from Gemini API:", apiError);
    throw new Error("Failed to communicate with the deadline update service.");
  }
};