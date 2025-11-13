// File: /api/chat.ts
import { 
  GoogleGenerativeAI, 
  Content, 
  HarmCategory, 
  HarmBlockThreshold 
} from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

// Best practice: Initialize the client *once* outside the handler.
// Use a specific ENV var name to avoid conflicts.
const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_AI_API_KEY is not set.");
}
const genAI = new GoogleGenerativeAI(apiKey!);

// Define safety settings for the model
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
// These environment variables MUST be set in your Vercel project settings.
const supabaseAdmin: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { history, message, salesSummary, productsSummary } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { 
          status: 400, headers: { 'Content-Type': 'application/json' }  
      });
    }

    // Check for the API key (which was checked at startup)
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), { 
          status: 500, headers: { 'Content-Type': 'application/json' } 
       });
    }

    // --- This is the corrected SDK flow ---

    // 1. Define the System Instruction (Context)
    const systemInstruction = `You are an AI assistant for an App system called Tiyeni.
Your role is to help the user understand their business data.
Answer questions based on the provided sales and product data.
Be concise and helpful. Format your answers clearly.
Current date is ${new Date().toLocaleDateString()}.

Here is a summary of the business data:
- Recent Sales: ${JSON.stringify(salesSummary, null, 2)}
- Products with low stock: ${JSON.stringify(productsSummary, null, 2)}
`;
    
    // 2. Get the model, passing the system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      },
      safetySettings,
    });

    // 3. Start the chat with the existing history
    // Note: 'history' must be an array matching the Content[] type, e.g.:
    // [{ role: "user", parts: [{ text: "Hello" }] }, { role: "model", parts: [{ text: "Hi!" }] }]
    const chat = model.startChat({
        history: history as Content[], // Cast history to the SDK's Content type
    });

    // 4. Send the new message (as a string, not an object)
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    // 5. Get the text by calling the text() function
    const text = response.text();

    return new Response(JSON.stringify({ text: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: 'Failed to get chat response from backend.' }), { 
        status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
}
