import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface PaymentDetails {
  transactionId: string | null;
  provider: string | null;
  amount: number | null;
  recipientUpi: string | null;
}

export async function extractPaymentDetailsFromImage(base64Image: string): Promise<PaymentDetails | null> {
  try {
    const prompt = `
      Please analyze this payment screenshot and extract four specific details:
      1. The UPI Transaction ID or Reference ID (usually a 12-digit number).
      2. The payment provider app name (e.g., Paytm, GPay, PhonePe).
      3. The exact payment amount (just the number).
      4. The exact recipient UPI ID.

      You MUST return the extraction strictly as a JSON object matching this schema exactly:
      {
        "transactionId": "123456789012" or null if not found,
        "provider": "Paytm" or null if not found,
        "amount": 200 or null if not found,
        "recipientUpi": "bharathvive143-2@okhdfcbank" or null if not found
      }
      Do not include any other text, markdown blocks like \`\`\`json, or formatting. Just the raw JSON object.
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([prompt, ...imageParts]);
    let text = (await result.response).text().trim();

    // Strip out potential markdown formatting
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const details = JSON.parse(text) as PaymentDetails;
    return details;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
