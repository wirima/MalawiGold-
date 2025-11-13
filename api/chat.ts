// File: /api/chat.ts
import { GoogleGenAI, Content } from '@google/genai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { history, message, salesSummary, productsSummary } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }  
      });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' } 
       });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an AI assistant for a Point of Sale system called TranscendPOS.
Your role is to help the user understand their business data.
Answer questions based on the provided sales and product data.
Be concise and helpful. Format your answers clearly.
Current date is ${new Date().toLocaleDateString()}.

Here is a summary of the business data:
- Recent Sales: ${JSON.stringify(salesSummary, null, 2)}
- Products with low stock: ${JSON.stringify(productsSummary, null, 2)}
`;
    
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    const response = await chat.sendMessage({ message });
    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: 'Failed to get chat response from backend.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
    });
  }
}
