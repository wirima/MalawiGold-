import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 dark:bg-black/50 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <code>
            {children}
        </code>
    </pre>
);

const serverlessFunctionCode = `// File: /api/generate-insights.ts
// This is a Vercel Serverless Function using the Edge Runtime.

import { GoogleGenAI } from '@google/genai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    // IMPORTANT: The API_KEY is securely accessed from Vercel's environment variables
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), { status: 500 });
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
    return new Response(JSON.stringify({ error: 'Failed to generate insights.' }), { status: 500 });
  }
}
`;

const ApiProxyGuidePage: React.FC = () => {
    const { hasPermission } = useAuth();
    
    if (!hasPermission('settings:view')) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold">Access Denied</h1>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">API Proxy Guide</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Secure your Gemini API key using a Vercel Serverless Function.
                </p>
            </div>
            <div className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
                <h3>Why is this necessary?</h3>
                <p>
                    Your Gemini API key is a secret and should never be exposed in your frontend code. Calling the Gemini API directly from the browser is insecure. The solution is to create a "proxy" on your backend. Your frontend will call your own secure endpoint, which then calls the Gemini API using the key stored safely on the server.
                </p>

                <h3>Implementation on Vercel</h3>
                <p>
                    Vercel makes this easy with Serverless Functions. Follow these steps:
                </p>
                <ol>
                    <li>
                        <strong>Create a new folder named <code>api</code></strong> at the root of your project.
                    </li>
                    <li>
                        <strong>Inside the <code>api</code> folder, create a new file named <code>generate-insights.ts</code></strong>.
                    </li>
                    <li>
                        <strong>Copy and paste the code below</strong> into your new <code>generate-insights.ts</code> file.
                    </li>
                </ol>

                <CodeBlock>{serverlessFunctionCode}</CodeBlock>

                <h3>How It Works</h3>
                <ul>
                    <li>Any file inside the <code>/api</code> directory automatically becomes an API endpoint on Vercel.</li>
                    <li>The frontend now sends its request to <code>/api/generate-insights</code>.</li>
                    <li>This serverless function securely reads the <code>API_KEY</code> from your Vercel project's environment variables.</li>
                    <li>It then calls the Gemini API and returns the response to the frontend.</li>
                </ul>
                <p className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 rounded-r-lg text-sm">
                    <strong>The frontend code has already been updated to use this new endpoint.</strong> Once you create this file and deploy to Vercel, your AI-powered reports will work securely.
                </p>
            </div>
        </div>
    );
};

export default ApiProxyGuidePage;
