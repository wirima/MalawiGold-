// File: /api/get-user-profile.ts
// This is a Vercel Serverless Function to securely fetch a user's application profile.

import { createClient } from '@supabase/supabase-js';

// This function can run on Vercel's Edge runtime for better performance.
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // 1. Extract the JWT from the Authorization header.
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        const token = authHeader.split(' ')[1];

        // 2. Initialize a temporary Supabase client to verify the user's token.
        // These env vars must be set in your Vercel project settings.
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || 'Invalid token'}` }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        // 3. Initialize a Supabase admin client to fetch data, bypassing RLS.
        // The SUPABASE_SERVICE_ROLE_KEY env var must be set in Vercel.
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('User') // Note: Table name is case-sensitive and must match your schema.
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
             console.error('Supabase profile fetch error:', profileError.message);
             // If the profile doesn't exist, it could be a race condition with the db trigger.
            if (profileError.code === 'PGRST116') { // "PGRST116: JSON object requested, but row not found"
                 return new Response(JSON.stringify({ error: 'User profile not found in database. Please try again shortly.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }
            throw profileError;
        }

        // 4. Return the user profile data.
        return new Response(JSON.stringify(userProfile), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error in get-user-profile function:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
