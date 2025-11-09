// File: /api/public-config.ts
// This Vercel Serverless Function securely provides the public environment
// variables needed by the frontend to initialize the Supabase client.

export default async function handler(req: Request) {
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // These environment variables MUST be set in your Vercel project settings.
    // This function can access them because it runs on the server.
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Server configuration missing for Supabase public keys.");
        return new Response(JSON.stringify({ error: 'Server configuration missing.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
        supabaseUrl,
        supabaseAnonKey,
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
