// This is a Vercel Serverless Function, designed to be placed in the /api directory.
// It creates a secure endpoint to fetch a user's application-specific profile.

// In a real project, you would install these packages. They are available in this environment.
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: Request) {
    // We only want to handle GET requests for this endpoint.
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

        // 2. Initialize the Supabase client and verify the user's token.
        // These environment variables must be set in your Vercel project settings.
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        // 3. Initialize Prisma and fetch the user's profile from your "User" table.
        // The DATABASE_URL env var must be set in Vercel for Prisma to connect.
        const prisma = new PrismaClient();
        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
        });

        // 4. If the profile doesn't exist, it's an error state. This can happen
        // if the database trigger to create a profile hasn't run yet.
        if (!userProfile) {
            return new Response(JSON.stringify({ error: 'User profile not found in database' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        // 5. Return the user profile data.
        return new Response(JSON.stringify(userProfile), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error in get-user-profile function:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
