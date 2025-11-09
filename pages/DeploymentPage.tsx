

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 dark:bg-black/50 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <code>
            {children}
        </code>
    </pre>
);

const Step: React.FC<{ number: number; title: string; children: React.ReactNode; isLast?: boolean; }> = ({ number, title, children, isLast }) => (
    <div className="flex gap-6">
        <div className="flex-shrink-0 flex flex-col items-center">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg">
                {number}
            </span>
            {!isLast && <div className="flex-1 w-px bg-slate-300 dark:bg-slate-600 my-2"></div>}
        </div>
        <div className="flex-1 pb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-slate-600 dark:text-slate-300">
                {children}
            </div>
        </div>
    </div>
);


const DeploymentPage: React.FC = () => {
    const { hasPermission } = useAuth();

    if (!hasPermission('settings:view')) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    You do not have permission to view this page.
                </p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">Deployment Guide: Supabase + Prisma on Vercel</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Follow these steps to connect your frontend to a real Supabase database using Prisma.
                </p>
            </div>
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                     <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">What You'll Need</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li>A free account at <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">supabase.com</a> and a new Supabase project.</li>
                            <li>Your Vercel account where this project will be deployed.</li>
                            <li>Node.js and npm/yarn installed on your local machine to run Prisma commands.</li>
                        </ul>
                    </div>

                    <Step number={1} title="Get Your Supabase Connection String">
                        <p>In your Supabase project dashboard, navigate to <strong>Project Settings</strong> (the gear icon) &gt; <strong>Database</strong>.</p>
                        <p>Under the "Connection string" section, find the URI that starts with <code>postgresql://</code>. This is your direct database connection string. You'll need it for both Prisma and Vercel.</p>
                    </Step>
                    
                    <Step number={2} title="Configure Prisma Schema">
                        <p>
                            A <code>prisma/schema.prisma</code> file has been added to this project. It contains the complete database schema that mirrors the application's data structures. This file is the single source of truth for your database tables and columns.
                        </p>
                        <p>You need to configure this file to connect to your Supabase database. Open <code>prisma/schema.prisma</code> and find the <code>datasource db</code> block. Then, open the <code>.env</code> file at the root of your project (create it if it doesn't exist) and add your connection string:</p>
                        <CodeBlock>{`.env

DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres"`}</CodeBlock>
                        <p className="text-sm">Replace <code>[YOUR-PASSWORD]</code> and <code>[HOST]</code> with the values from your Supabase connection string.</p>
                    </Step>

                    <Step number={3} title="Sync Your Database with Prisma">
                        <p>
                            Now for the magic. Instead of writing complex SQL scripts, you can use Prisma to automatically create all the necessary tables in your Supabase database based on your schema file.
                        </p>
                        <p>Open your terminal at the project root and run the following command:</p>
                        <CodeBlock>npx prisma db push</CodeBlock>
                        <p>Prisma will connect to your Supabase database and create all the tables, columns, and relations defined in <code>schema.prisma</code>. After it succeeds, you can go to the "Table Editor" in Supabase to see your new tables.</p>
                    </Step>

                    <Step number={4} title="Create User Profile Trigger in Supabase">
                        <p>This is a critical step. When a user signs up, Supabase creates a record in its private <code>auth.users</code> table. We need to automatically create a corresponding profile in our public <code>"User"</code> table.</p>
                        <p>Go to your Supabase project dashboard, navigate to the <strong>SQL Editor</strong>, click <strong>+ New query</strong>, and run the following SQL code. This creates a function and a trigger that runs after every new user signup.</p>
                        <CodeBlock>{`-- Creates a new BusinessLocation and a User profile when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_location_id UUID;
  manager_role_id TEXT;
BEGIN
  -- 1. Create a new business location named after the user's business from signup metadata
  INSERT INTO "public"."BusinessLocation" (name)
  VALUES (NEW.raw_user_meta_data->>'business_name')
  RETURNING id INTO new_location_id;

  -- 2. Find the ID of the 'Manager (Supervisor)' role to assign as default
  SELECT id INTO manager_role_id FROM "public"."Role" WHERE name = 'Manager (Supervisor)';

  -- 3. Create a user profile with the business name as their display name
  INSERT INTO "public"."User" (id, email, name, "roleId", "businessLocationId")
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'business_name',
    manager_role_id,
    new_location_id
  );
  RETURN NEW;
END;
$$;

-- Create the trigger that executes the function after a new user is added
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`}</CodeBlock>
                    </Step>
                    
                    <Step number={5} title="Configure Vercel Environment Variables">
                        <p>For your deployed application to connect to Supabase, Prisma, and Gemini, you must add your secret keys to your Vercel project's environment variables.</p>
                         <p>In your Vercel project dashboard, go to <strong>Settings &gt; Environment Variables</strong> and add the following:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>API_KEY</strong>: Your Gemini API key. Used by backend functions like <code>/api/generate-insights</code>.</li>
                            <li><strong>DATABASE_URL</strong>: The full Prisma connection string from Step 1. Used by the backend.</li>
                            <li><strong>SUPABASE_URL</strong>: Your project's URL from Supabase (API Settings).</li>
                            <li><strong>SUPABASE_ANON_KEY</strong>: Your project's `anon` (public) key from Supabase (API Settings).</li>
                        </ul>
                         <p className="!mt-4 text-sm"><strong>Note:</strong> These variables are only accessible on the server side (in your <code>/api</code> functions). The frontend will securely fetch the public keys it needs from a dedicated API endpoint.</p>
                    </Step>

                     <Step number={6} title="Build Your Backend with Serverless Functions" isLast={true}>
                         <p>Your database and frontend are now ready. The final piece is to build the backend logic inside Vercel Serverless Functions. All your Prisma queries must run on the server, never in the browser.</p>
                         <p>An example has been created at <code>/api/get-user-profile.ts</code>. You can follow this pattern to create more endpoints for fetching products, creating sales, etc. The frontend is already configured to call these API routes.</p>
                    </Step>
                </div>
            </div>
        </div>
    );
};

export default DeploymentPage;
