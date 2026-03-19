import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractUPIFromImage(base64Image: string): Promise<string | null> {
  try {
    const prompt = `
      Please analyze this payment screenshot and extract ONLY the UPI Transaction ID (a 12-digit number usually).
      Return ONLY the number. Do not return any other text, spaces, or words. 
      If you cannot find a valid UPI transaction ID (e.g., if it's not a payment screenshot or it's unreadable), reply with EXACTLY "NOT_FOUND".
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ];

    let text;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent([prompt, ...imageParts]);
      text = (await result.response).text().trim();
    } catch (e: any) {
      console.error("Gemini model failed (gemini-2.5-flash)", e.message);
      return null;
    }

    if (text === "NOT_FOUND" || !text) {
      return null;
    }

    // Attempt to extract 10-14 digit number just in case AI includes spaces
    const match = text.match(/\d{10,14}/);
    if (match) {
      return match[0];
    }

    return text; // Fallback
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
