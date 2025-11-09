// This file is no longer used for the primary authentication flow
// to avoid crashes in environments without build-time environment variable injection.
// The Supabase client is now initialized asynchronously within AuthContext.tsx
// after fetching configuration from a secure API endpoint.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const supabase: SupabaseClient | null = null;

console.warn(
    'DEPRECATION WARNING: supabaseClient.ts is not intended for direct use in the new authentication flow. ' +
    'The Supabase client is managed by AuthContext. If you see this, it means some part of the app is still using the old synchronous initialization, which is unreliable.'
);
