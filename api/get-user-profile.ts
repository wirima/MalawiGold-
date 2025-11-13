// File: /api/get-user-profile.ts
// This is a Vercel Edge Function to securely fetch a user's application profile.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

// Create a single Supabase Admin Client.
// This client can bypass RLS and also verify user tokens.
// These environment variables MUST be set in your Vercel project settings.
const supabaseAdmin: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // 2. Verify the user's token using the ADMIN client.
    // We safely destructure 'data' first, then 'user' to prevent a TypeError.
    const { data, error: userError } = await supabaseAdmin.auth.getUser(token);
    const user = data?.user;

    if (userError || !user) {
      return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || 'Invalid token'}` }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Fetch the user's profile data from the 'profiles' table.
    //    We already have the admin client, so no need to create a new one.
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles') // **Note:** Changed 'User' to 'profiles'. 'profiles' is the Supabase standard. Please match this to your table name.
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Supabase profile fetch error:', profileError.message);
      
      // "PGRST116: JSON object requested, but row not found"
      // This means auth.user exists, but the 'profiles' row does not.
      if (profileError.code === 'PGRST116') { 
        return new Response(JSON.stringify({ error: 'User profile not found in database.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      throw profileError; // Throw other errors to be caught by the catch block
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
