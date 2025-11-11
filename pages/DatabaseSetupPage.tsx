import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CodeBlock: React.FC<{ children: React.ReactNode; language?: string }> = ({ children, language }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (typeof children === 'string') {
            await navigator.clipboard.writeText(children);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="relative group">
            <pre className="bg-slate-800 dark:bg-black/50 text-slate-100 rounded-lg p-4 pr-16 font-mono text-sm overflow-x-auto">
                <code className={language ? `language-${language}` : ''}>
                    {children}
                </code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-md bg-slate-600 hover:bg-slate-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Copy code to clipboard"
            >
                {isCopied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
};

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

const fullSqlScript = `-- 1. Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create tables without foreign keys first
CREATE TABLE "BusinessLocation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL
);

CREATE TABLE "Role" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "permissions" TEXT[] NOT NULL
);

CREATE TABLE "Brand" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "Category" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "Unit" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL UNIQUE,
    "shortName" TEXT NOT NULL UNIQUE
);

CREATE TABLE "Variation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "CustomerGroup" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL UNIQUE,
    "discountPercentage" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "ExpenseCategory" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL UNIQUE
);

-- 3. Create tables with foreign keys
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "roleId" TEXT NOT NULL REFERENCES "Role"(id),
    "businessLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id),
    "account_status" TEXT NOT NULL DEFAULT 'trial'
);

CREATE TABLE "Product" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "categoryId" UUID NOT NULL REFERENCES "Category"(id),
    "brandId" UUID NOT NULL REFERENCES "Brand"(id),
    "unitId" UUID NOT NULL REFERENCES "Unit"(id),
    "businessLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id),
    "costPrice" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "reorderPoint" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isNotForSale" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "productType" TEXT NOT NULL,
    "barcodeType" TEXT NOT NULL,
    "taxAmount" DOUBLE PRECISION,
    "taxType" TEXT,
    "isAgeRestricted" BOOLEAN DEFAULT false,
    "parentProductId" UUID,
    "variationAttributes" JSONB,
    UNIQUE ("sku", "businessLocationId")
);

CREATE TABLE "VariationValue" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "variationId" UUID NOT NULL REFERENCES "Variation"(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL
);

CREATE TABLE "Customer" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "businessName" TEXT,
    "email" TEXT UNIQUE,
    "phone" TEXT,
    "address" TEXT,
    "customerGroupId" UUID NOT NULL REFERENCES "CustomerGroup"(id)
);

CREATE TABLE "Supplier" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "businessName" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT,
    "address" TEXT
);

CREATE TABLE "Sale" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "customerId" UUID NOT NULL REFERENCES "Customer"(id),
    "businessLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id),
    "total" DOUBLE PRECISION NOT NULL,
    "passportNumber" TEXT,
    "nationality" TEXT,
    "status" TEXT,
    "discount" JSONB,
    "isQueued" BOOLEAN DEFAULT false,
    "customerEmailForDocs" TEXT,
    "payments" JSONB NOT NULL
);

CREATE TABLE "CustomerReturn" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "originalSaleId" UUID NOT NULL REFERENCES "Sale"(id),
    "customerId" UUID NOT NULL REFERENCES "Customer"(id),
    "reason" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "Purchase" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "supplierId" UUID NOT NULL REFERENCES "Supplier"(id),
    "total" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "PurchaseReturn" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "supplierId" UUID NOT NULL REFERENCES "Supplier"(id),
    "total" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "Draft" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "customerId" UUID NOT NULL REFERENCES "Customer"(id),
    "total" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "Quotation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "customerId" UUID NOT NULL REFERENCES "Customer"(id),
    "total" DOUBLE PRECISION NOT NULL,
    "expiryDate" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "StockTransfer" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "fromLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id),
    "toLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id),
    "status" TEXT NOT NULL
);

CREATE TABLE "CartItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" UUID NOT NULL REFERENCES "Product"(id),
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "saleId" UUID REFERENCES "Sale"(id),
    "purchaseId" UUID REFERENCES "Purchase"(id),
    "returnId" UUID REFERENCES "CustomerReturn"(id),
    "draftId" UUID REFERENCES "Draft"(id),
    "quotationId" UUID REFERENCES "Quotation"(id),
    "stockTransferId" UUID REFERENCES "StockTransfer"(id)
);

CREATE TABLE "StockAdjustment" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "productId" UUID NOT NULL REFERENCES "Product"(id),
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL
);

CREATE TABLE "StockTransferRequest" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "fromLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id),
    "toLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id),
    "productId" UUID NOT NULL REFERENCES "Product"(id),
    "quantity" INTEGER NOT NULL,
    "requestingUserId" UUID NOT NULL REFERENCES "User"(id),
    "status" TEXT NOT NULL
);

CREATE TABLE "Expense" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "categoryId" UUID NOT NULL REFERENCES "ExpenseCategory"(id),
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL
);

CREATE TABLE "CustomerRequest" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "text" TEXT NOT NULL,
    "cashierId" UUID NOT NULL REFERENCES "User"(id),
    "cashierName" TEXT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- And so on for all other tables...
`;

const insertRolesSql = `INSERT INTO "public"."Role" ("id", "name", "description", "permissions") VALUES
('admin', 'Administrator', 'Has full access to all system features.', '{dashboard:view,growth:view,products:view,products:manage,products:add,products:delete,products:update_price,products:print_labels,products:variations,products:import,products:import_stock,products:import_units,products:price_groups,products:units,products:categories,products:brands,products:documents,contacts:view,contacts:manage,contacts:import,purchases:view,purchases:manage,sell:view,sell:pos,sell:sales,sell:manage,shipping:view,shipping:manage,discounts:view,returns:view,returns:manage,pos:apply_discount,pos:change_price,pos:process_return,pos:void_sale,stock_transfer:view,stock_transfer:manage,stock_adjustment:view,stock_adjustment:manage,expense:view,expense:manage,reports:view,reports:customer_demand,reports:return_analysis,users:view,users:manage,notifications:manage,settings:view,settings:tax,settings:product,settings:contact,settings:sale,settings:pos,settings:purchases,settings:payment,settings:dashboard,settings:system,settings:prefixes,settings:email,settings:sms,settings:reward_points,settings:modules,settings:custom_labels,settings:locations,settings:age_verification,settings:integrations,settings:accounts,settings:subscription}'),
('manager', 'Manager (Supervisor)', 'Can manage products, sales, and contacts, and view reports.', '{dashboard:view,products:view,products:manage,products:delete,products:variations,products:import,products:import_stock,products:import_units,products:update_price,products:documents,contacts:view,contacts:manage,purchases:view,purchases:manage,sell:pos,sell:sales,sell:manage,pos:apply_discount,pos:change_price,pos:process_return,pos:void_sale,shipping:view,shipping:manage,stock_adjustment:view,stock_adjustment:manage,returns:view,returns:manage,reports:view,reports:customer_demand,reports:return_analysis,users:view,settings:view,settings:tax,settings:product,settings:contact,settings:sale,settings:pos,settings:purchases,settings:payment,settings:dashboard,settings:system,settings:prefixes,settings:email,settings:sms,settings:reward_points,settings:modules,settings:custom_labels,settings:locations,settings:age_verification,settings:integrations,settings:accounts}'),
('cashier', 'Cashier', 'Limited to processing sales via POS and viewing products.', '{products:view,purchases:view,sell:pos,shipping:view}'),
('sales_rep', 'Sales Representative', 'Responsible for making sales and managing customer relationships.', '{dashboard:view,products:view,contacts:view,contacts:manage,sell:view,sell:pos,sell:sales,sell:manage,pos:apply_discount,reports:view}');
`;

const userTriggerSql = `-- Creates a new BusinessLocation and a User profile when a new user signs up.
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

  -- 3. Create a user profile with a 'trial' status
  INSERT INTO "public"."User" (id, email, name, "roleId", "businessLocationId", "account_status")
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'business_name',
    manager_role_id,
    new_location_id,
    'trial' -- Set default account status
  );
  RETURN NEW;
END;
$$;

-- Create the trigger that executes the function after a new user is added
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

const rlsSql = `
-- Enable RLS for all tables
ALTER TABLE "public"."BusinessLocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
-- ... and so on for ALL your other tables

-- Create a blanket policy to allow authenticated users to READ all data.
-- Your backend will use the service_role_key to bypass RLS for writing data.
CREATE POLICY "Allow authenticated read access" ON "public"."BusinessLocation" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON "public"."Role" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON "public"."User" FOR SELECT USING (auth.role() = 'authenticated');
-- ... create a similar read policy for ALL your other tables
`;

const saleFunctionSql = `-- This function creates a sale, its items, and decrements stock in a single transaction.
create function public.create_sale_and_update_stock(
    p_customer_id uuid,
    p_total double precision,
    p_payments jsonb,
    p_items jsonb,
    p_business_location_id uuid
)
returns uuid as $$
declare
  new_sale_id uuid;
  item record;
begin
  -- 1. Insert the new sale record
  insert into "public"."Sale" ("customerId", total, payments, "businessLocationId")
  values (p_customer_id, p_total, p_payments, p_business_location_id)
  returning id into new_sale_id;

  -- 2. Loop through items, insert them, and update product stock
  for item in select * from jsonb_to_recordset(p_items) as x(
    "productId" uuid,
    quantity int,
    price double precision,
    "costPrice" double precision,
    name text,
    sku text,
    "imageUrl" text
  )
  loop
    -- Insert into CartItem table, linking to the new sale
    insert into "public"."CartItem" ("saleId", "productId", quantity, price, "costPrice", name, sku, "imageUrl")
    values (new_sale_id, item."productId", item.quantity, item.price, item."costPrice", item.name, item.sku, item."imageUrl");

    -- Decrement the stock for the corresponding product
    update "public"."Product"
    set stock = stock - item.quantity
    where id = item."productId";
  end loop;

  return new_sale_id;
end;
$$ language plpgsql volatile;
`;

const apiDataEndpoint = `// File: /api/app-data.ts

import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

// Helper to add CORS headers for local development
function withCors(response: Response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return withCors(new Response(null, { status: 204 }));
    }

    try {
        // Initialize the Supabase admin client with the service role key
        // This client bypasses all RLS policies
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify the user's JWT to secure the endpoint
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return withCors(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
        }
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);

        if (!user) {
            return withCors(new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 }));
        }
        
        // Handle GET request to fetch all initial data
        if (req.method === 'GET') {
            const tables = [
                'User', 'Role', 'Product', 'StockAdjustment', 'Customer', 'CustomerGroup',
                'Supplier', 'Variation', 'VariationValue', 'Brand', 'Category', 'Unit',
                'Sale', 'Draft', 'Quotation', 'Purchase', 'PurchaseReturn', 'Expense',
                'ExpenseCategory', 'BusinessLocation', 'StockTransfer', 'Shipment',
                'PaymentMethod', 'CustomerRequest', 'CustomerReturn',
                'IntegrationConnection', 'BankAccount', 'StockTransferRequest', 'NotificationTemplate'
            ];

            const promises = tables.map(table => supabaseAdmin.from(table).select('*'));
            const results = await Promise.all(promises);
            
            const errors = results.filter(res => res.error);
            if (errors.length > 0) {
                console.error("Supabase fetch errors:", errors.map(e => e.error?.message));
                throw new Error('One or more database queries failed.');
            }

            const data = results.reduce((acc, res, index) => {
                const tableName = tables[index];
                // Convert table name to camelCase for the frontend (e.g., BusinessLocation -> businessLocations)
                const key = tableName.charAt(0).toLowerCase() + tableName.slice(1) + 's';
                acc[key] = res.data;
                return acc;
            }, {} as Record<string, any>);

            return withCors(new Response(JSON.stringify(data), { status: 200 }));
        }

        // Handle POST for data mutations (example for adding a product)
        if (req.method === 'POST') {
             const { type, payload } = await req.json();
             let result;
             
             switch(type) {
                case 'ADD_PRODUCT':
                    const { data, error } = await supabaseAdmin.from('Product').insert(payload).select().single();
                    if(error) throw error;
                    result = data;
                    break;
                // ... add other cases like 'UPDATE_PRODUCT', 'ADD_SALE', etc.
                default:
                    return withCors(new Response(JSON.stringify({ error: \`Unknown mutation type: \${type}\` }), { status: 400 }));
             }
             return withCors(new Response(JSON.stringify(result), { status: 201 }));
        }

        return withCors(new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 }));

    } catch (error: any) {
        console.error("API Error:", error);
        return withCors(new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 }));
    }
}`;

const authContextContent = `// File: contexts/AuthContext.tsx
// This file is simplified to only show the data fetching part.
// You would replace your existing AuthContext with a file like this.

// ... (imports and other context setup)

const AuthProvider = ({ children }) => {
    // ... (auth state, supabase client initialization)

    const fetchAllData = useCallback(async (session: Session) => {
        try {
            // Call your single backend endpoint
            const response = await fetch('/api/app-data', {
                headers: { 'Authorization': \`Bearer \${session.access_token}\` }
            });
            if (!response.ok) throw new Error('Failed to fetch app data');
            const data = await response.json();
            
            // Set all your state variables from the response
            setUsers(data.users || []);
            setRoles(data.roles || []);
            setProducts(data.products || []);
            setSales(data.sales || []);
            setCustomers(data.customers || []);
            // ... and so on for every other piece of data
            console.log('Successfully fetched all application data from backend.');

        } catch (error) {
            console.error("Error fetching all app data:", error);
        }
    }, []);

    useEffect(() => {
        if (supabase) {
            // ... (existing logic to handle auth state changes)
            
            // When a user signs in, fetch all their data
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                if (session) {
                    fetchAppUser(session).then(() => fetchAllData(session));
                } else {
                    // Clear data on sign out
                    setCurrentUser(null);
                    setProducts([]); 
                    // etc.
                }
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        }
    }, [supabase, fetchAppUser, fetchAllData]);
    
    // ... (rest of the context provider)
}
`;

const DatabaseSetupPage: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">Database Setup Guide: Supabase (Direct API)</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Follow these instructions to connect your application directly to Supabase without using Prisma.
                </p>
            </div>
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Step number={1} title="Create Your Database Tables with SQL">
                        <p>Instead of a schema file, you'll create tables directly in Supabase using SQL.</p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Go to your Supabase project dashboard and click on the <strong>SQL Editor</strong>.</li>
                            <li>Click <strong>+ New query</strong>.</li>
                            <li>Copy and paste the entire SQL script below into the editor and click <strong>RUN</strong>. This will create all the necessary tables for the application.</li>
                        </ol>
                        <CodeBlock language="sql">{fullSqlScript}</CodeBlock>
                    </Step>

                    <Step number={2} title="Insert Default Roles & Create User Trigger">
                        <p>Next, we need to populate the <code>Role</code> table with default roles and set up a trigger that automatically creates a user profile when a new user signs up in Supabase Auth.</p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>In the <strong>SQL Editor</strong>, run the following script to insert the default roles.</li>
                        </ol>
                        <CodeBlock language="sql">{insertRolesSql}</CodeBlock>
                        <ol className="list-decimal pl-5 space-y-2" start={2}>
                             <li>Now, run this second script to create the user profile function and trigger.</li>
                        </ol>
                        <CodeBlock language="sql">{userTriggerSql}</CodeBlock>
                    </Step>
                    
                    <Step number={3} title="Create Sale Transaction Function">
                        <p>To ensure data integrity, creating a sale and updating product stock should happen in a single, atomic transaction. We can achieve this with a PostgreSQL function (also known as a Remote Procedure Call or RPC in Supabase).</p>
                        <p>In the <strong>SQL Editor</strong>, run the following script to create the function.</p>
                        <CodeBlock language="sql">{saleFunctionSql}</CodeBlock>
                    </Step>

                    <Step number={4} title="Enable Row Level Security (RLS)">
                        <p>RLS is Supabase's powerful security feature. By default, it blocks all access to your tables. You must create "policies" to allow access.</p>
                        <p>Run the following SQL script to enable RLS on all tables and create a simple policy that allows any logged-in user to <strong>read</strong> data. All write operations (insert, update, delete) will be handled securely by our backend.</p>
                        <CodeBlock language="sql">{rlsSql}</CodeBlock>
                         <p className="text-sm"><strong>Note:</strong> You must create a read policy for every table you want the frontend to be able to access.</p>
                    </Step>

                    <Step number={5} title="Create a Backend API to Fetch & Update Data">
                        <p>To securely interact with your data, we need a backend API. This Vercel Serverless Function will use the Supabase Admin client (via a secure service key) to fetch all application data at once and handle data mutations like creating products or sales.</p>
                         <ol className="list-decimal pl-5 space-y-2">
                             <li>Create an <code>api</code> folder at the root of your project if it doesn't exist.</li>
                             <li>Inside <code>api</code>, create a file named <code>app-data.ts</code>.</li>
                            <li>Copy and paste the code below into <code>/api/app-data.ts</code>.</li>
                        </ol>
                        <CodeBlock language="typescript">{apiDataEndpoint}</CodeBlock>
                    </Step>
                    
                     <Step number={6} title="Update Frontend to Use the API">
                        <p>Finally, update <code>contexts/AuthContext.tsx</code> to call your new <code>/api/app-data</code> endpoint upon login to fetch data, instead of using the local mock data.</p>
                        <p>Your new data fetching logic inside the context will look similar to this:</p>
                        <CodeBlock language="typescript">{authContextContent}</CodeBlock>
                    </Step>

                    <Step number={7} title="Configure Vercel Environment Variables" isLast={true}>
                        <p>For your deployed application to function correctly, you must add your secret keys to your Vercel project's environment variables. These are kept secure on the server and are not exposed to the public.</p>
                        <p>In your Vercel project dashboard, go to <strong>Settings &gt; Environment Variables</strong> and add the following keys:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>API_KEY</strong>: This is your <strong>Google Gemini API key</strong>. It is required for all AI-powered features, including the Dashboard Insights, AI Reports, and the Chatbot. You can get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Google AI Studio</a>.
                            </li>
                            <li><strong>SUPABASE_URL</strong>: Your project's URL from your Supabase Dashboard (Settings &gt; API).</li>
                            <li><strong>SUPABASE_ANON_KEY</strong>: Your project's `anon` (public) key from Supabase (Settings &gt; API).</li>
                             <li><strong>SUPABASE_SERVICE_ROLE_KEY</strong>: Your project's `service_role` (secret) key from Supabase (Settings &gt; API). This is essential for the backend API to bypass RLS and perform database operations.</li>
                        </ul>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 !mt-6">How the Gemini API Key is Used Securely</h4>
                        <p>
                            The frontend application <strong>never</strong> directly accesses your <code>API_KEY</code>. Instead, when you request an AI insight, the frontend makes a request to a local API proxy endpoint (e.g., <code>/api/generate-insights</code>). This endpoint is a serverless function running securely on Vercel. It is the only part of the system that can access <code>process.env.API_KEY</code>, use it to call the Gemini API, and then return the result to the frontend.
                        </p>
                        <p>
                            This proxy pattern ensures your secret API key is never exposed in the browser. For a more detailed explanation of this architecture, you can view the <Link to="/app/settings/api-proxy-guide" className="text-indigo-600 dark:text-indigo-400 hover:underline">API Proxy Guide</Link> page (requires login).
                        </p>
                    </Step>
                </div>
            </div>
        </div>
    );
};

export default DatabaseSetupPage;