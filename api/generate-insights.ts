// File: /api/generate-insights.ts
// This is a Vercel Serverless Function using the Edge Runtime.

import { GoogleGenAI } from '@google/genai';

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
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }  
      });
    }

    // IMPORTANT: The API_KEY is securely accessed from Vercel's environment variables
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' } 
       });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error in serverless function:", error);
    return new Response(JSON.stringify({ error: 'Failed to generate insights from the backend.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
    });
  }
}
