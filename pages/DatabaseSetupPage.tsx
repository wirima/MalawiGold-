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

const fullSqlScript = `-- This script creates all necessary tables for the application.
-- Run this in the Supabase SQL Editor.

-- 1. Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create tables without foreign keys first to avoid dependency issues
CREATE TABLE "public"."BusinessLocation" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL);
CREATE TABLE "public"."Role" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL UNIQUE, "description" TEXT NOT NULL, "permissions" TEXT[] NOT NULL);
CREATE TABLE "public"."Brand" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL UNIQUE);
CREATE TABLE "public"."Category" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL UNIQUE);
CREATE TABLE "public"."Unit" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL UNIQUE, "shortName" TEXT NOT NULL UNIQUE);
CREATE TABLE "public"."Variation" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL UNIQUE);
CREATE TABLE "public"."CustomerGroup" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL UNIQUE, "discountPercentage" DOUBLE PRECISION NOT NULL);
CREATE TABLE "public"."ExpenseCategory" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL UNIQUE);
CREATE TABLE "public"."BankAccount" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "accountName" TEXT NOT NULL, "bankName" TEXT NOT NULL, "accountNumber" TEXT NOT NULL);
CREATE TABLE "public"."IntegrationConnection" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "provider" TEXT NOT NULL, "name" TEXT NOT NULL, "config" JSONB NOT NULL);
CREATE TABLE "public"."NotificationTemplate" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "type" TEXT NOT NULL, "subject" TEXT NOT NULL, "body" TEXT NOT NULL, "tags" TEXT[] NOT NULL, "group" TEXT NOT NULL);

-- 3. Create tables with foreign key dependencies
CREATE TABLE "public"."User" ("id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, "name" TEXT NOT NULL, "email" TEXT NOT NULL UNIQUE, "roleId" TEXT NOT NULL REFERENCES "Role"(id), "businessLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id), "account_status" TEXT NOT NULL DEFAULT 'trial', "onboarding_complete" BOOLEAN NOT NULL DEFAULT false, "subscriptionPlan" TEXT);
CREATE TABLE "public"."Product" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL, "sku" TEXT NOT NULL, "categoryId" UUID NOT NULL REFERENCES "Category"(id), "brandId" UUID NOT NULL REFERENCES "Brand"(id), "unitId" UUID NOT NULL REFERENCES "Unit"(id), "businessLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id), "costPrice" DOUBLE PRECISION NOT NULL, "price" DOUBLE PRECISION NOT NULL, "stock" INTEGER NOT NULL, "reorderPoint" INTEGER NOT NULL, "imageUrl" TEXT NOT NULL, "isNotForSale" BOOLEAN NOT NULL DEFAULT false, "description" TEXT, "productType" TEXT NOT NULL, "barcodeType" TEXT NOT NULL, "taxAmount" DOUBLE PRECISION, "taxType" TEXT, "isAgeRestricted" BOOLEAN DEFAULT false, "parentProductId" UUID, "variationAttributes" JSONB, UNIQUE ("sku", "businessLocationId"));
CREATE TABLE "public"."VariationValue" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "variationId" UUID NOT NULL REFERENCES "Variation"(id) ON DELETE CASCADE, "name" TEXT NOT NULL);
CREATE TABLE "public"."Customer" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL, "businessName" TEXT, "email" TEXT UNIQUE, "phone" TEXT, "address" TEXT, "customerGroupId" UUID NOT NULL REFERENCES "CustomerGroup"(id));
CREATE TABLE "public"."Supplier" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL, "businessName" TEXT, "email" TEXT UNIQUE, "phone" TEXT, "address" TEXT);
CREATE TABLE "public"."Sale" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "customerId" UUID NOT NULL REFERENCES "Customer"(id), "businessLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id), "total" DOUBLE PRECISION NOT NULL, "passportNumber" TEXT, "nationality" TEXT, "status" TEXT, "discount" JSONB, "isQueued" BOOLEAN DEFAULT false, "customerEmailForDocs" TEXT, "payments" JSONB NOT NULL);
CREATE TABLE "public"."CartItem" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "productId" UUID NOT NULL REFERENCES "Product"(id), "quantity" INTEGER NOT NULL, "originalPrice" DOUBLE PRECISION, "saleId" UUID REFERENCES "Sale"(id) ON DELETE CASCADE);
CREATE TABLE "public"."CustomerReturn" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "originalSaleId" TEXT NOT NULL, "customerId" UUID NOT NULL REFERENCES "Customer"(id), "reason" TEXT NOT NULL, "total" DOUBLE PRECISION NOT NULL);
CREATE TABLE "public"."Purchase" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "supplierId" UUID NOT NULL REFERENCES "Supplier"(id), "total" DOUBLE PRECISION NOT NULL);
CREATE TABLE "public"."PurchaseReturn" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "supplierId" UUID NOT NULL REFERENCES "Supplier"(id), "total" DOUBLE PRECISION NOT NULL);
CREATE TABLE "public"."Draft" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "customerId" UUID NOT NULL REFERENCES "Customer"(id), "total" DOUBLE PRECISION NOT NULL);
CREATE TABLE "public"."Quotation" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "customerId" UUID NOT NULL REFERENCES "Customer"(id), "total" DOUBLE PRECISION NOT NULL, "expiryDate" TIMESTAMPTZ NOT NULL);
CREATE TABLE "public"."StockTransfer" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "fromLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id), "toLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id), "status" TEXT NOT NULL);
CREATE TABLE "public"."StockAdjustment" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "productId" UUID NOT NULL REFERENCES "Product"(id), "type" TEXT NOT NULL, "quantity" INTEGER NOT NULL, "reason" TEXT NOT NULL);
CREATE TABLE "public"."StockTransferRequest" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "fromLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id), "toLocationId" UUID NOT NULL REFERENCES "BusinessLocation"(id), "productId" UUID NOT NULL REFERENCES "Product"(id), "quantity" INTEGER NOT NULL, "requestingUserId" UUID NOT NULL REFERENCES "User"(id), "status" TEXT NOT NULL);
CREATE TABLE "public"."Expense" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "date" TIMESTAMPTZ NOT NULL DEFAULT now(), "categoryId" UUID NOT NULL REFERENCES "ExpenseCategory"(id), "amount" DOUBLE PRECISION NOT NULL, "description" TEXT NOT NULL);
CREATE TABLE "public"."CustomerRequest" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "text" TEXT NOT NULL, "cashierId" UUID NOT NULL REFERENCES "User"(id), "cashierName" TEXT NOT NULL, "date" TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE "public"."Shipment" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "saleId" UUID NOT NULL REFERENCES "Sale"(id), "customerName" TEXT NOT NULL, "shippingAddress" TEXT NOT NULL, "trackingNumber" TEXT, "status" TEXT NOT NULL);
CREATE TABLE "public"."PaymentMethod" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL, "type" TEXT NOT NULL, "accountId" UUID REFERENCES "BankAccount"(id), "integrationId" UUID REFERENCES "IntegrationConnection"(id));
CREATE TABLE "public"."ProductDocument" ("id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "name" TEXT NOT NULL, "description" TEXT, "productIds" UUID[] NOT NULL, "fileUrl" TEXT NOT NULL, "fileName" TEXT NOT NULL, "fileType" TEXT NOT NULL, "uploadedDate" TIMESTAMPTZ NOT NULL DEFAULT now());
`;

const insertRolesSql = `INSERT INTO "public"."Role" ("id", "name", "description", "permissions") VALUES
('admin', 'Administrator', 'Has full access to all system features.', '{dashboard:view,growth:view,products:view,products:manage,products:add,products:delete,products:update_price,products:print_labels,products:variations,products:import,products:import_stock,products:import_units,products:price_groups,products:units,products:categories,products:brands,products:documents,contacts:view,contacts:manage,contacts:import,purchases:view,purchases:manage,sell:view,sell:pos,sell:sales,sell:manage,shipping:view,shipping:manage,discounts:view,returns:view,returns:manage,pos:apply_discount,pos:change_price,pos:process_return,pos:void_sale,stock_transfer:view,stock_transfer:manage,stock_adjustment:view,stock_adjustment:manage,expense:view,expense:manage,reports:view,reports:customer_demand,reports:return_analysis,users:view,users:manage,notifications:manage,settings:view,settings:tax,settings:product,settings:contact,settings:sale,settings:pos,settings:purchases,settings:payment,settings:dashboard,settings:system,settings:prefixes,settings:email,settings:sms,settings:reward_points,settings:modules,settings:custom_labels,settings:locations,settings:age_verification,settings:integrations,settings:accounts,settings:subscription}'),
('manager', 'Manager (Supervisor)', 'Can manage products, sales, and contacts, and view reports.', '{dashboard:view,products:view,products:manage,products:delete,products:variations,products:import,products:import_stock,products:import_units,products:update_price,products:documents,contacts:view,contacts:manage,purchases:view,purchases:manage,sell:pos,sell:sales,sell:manage,pos:apply_discount,pos:change_price,pos:process_return,pos:void_sale,shipping:view,shipping:manage,stock_adjustment:view,stock_adjustment:manage,returns:view,returns:manage,reports:view,reports:customer_demand,reports:return_analysis,users:view,settings:view,settings:tax,settings:product,settings:contact,settings:sale,settings:pos,settings:purchases,settings:payment,settings:dashboard,settings:system,settings:prefixes,settings:email,settings:sms,settings:reward_points,settings:modules,settings:custom_labels,settings:locations,settings:age_verification,settings:integrations,settings:accounts}'),
('cashier', 'Cashier', 'Limited to processing sales via POS and viewing products.', '{products:view,purchases:view,sell:pos,shipping:view}'),
('sales_rep', 'Sales Representative', 'Responsible for making sales and managing customer relationships.', '{dashboard:view,products:view,contacts:view,contacts:manage,sell:view,sell:pos,sell:sales,sell:manage,pos:apply_discount,reports:view}');
`;

const initialDataSql = `-- This script populates your tables with essential starting data.
-- Run this AFTER creating tables and inserting roles.

-- Customer Groups
INSERT INTO "public"."CustomerGroup" ("name", "discountPercentage") VALUES
('Standard', 0), ('Wholesale', 15), ('VIP', 25);

-- Default Walk-in Customer
INSERT INTO "public"."Customer" ("name", "customerGroupId") 
SELECT 'Walk-in Customer', id FROM "public"."CustomerGroup" WHERE name = 'Standard' LIMIT 1;

-- Essential Product Attributes
INSERT INTO "public"."Brand" ("name") VALUES ('Generic'), ('Morning Dew'), ('Sweet Treats');
INSERT INTO "public"."Category" ("name") VALUES ('Miscellaneous'), ('Coffee'), ('Pastry');
INSERT INTO "public"."Unit" ("name", "shortName") VALUES ('Piece', 'pc(s)'), ('Kilogram', 'kg'), ('Liter', 'l');

-- Default Expense Categories
INSERT INTO "public"."ExpenseCategory" ("name") VALUES ('Rent'), ('Utilities'), ('Supplies'), ('Marketing'), ('Salaries');
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
  INSERT INTO "public"."User" (id, email, name, "roleId", "businessLocationId", "account_status", "onboarding_complete")
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'business_name',
    manager_role_id,
    new_location_id,
    'onboarding_pending',
    false
  );
  RETURN NEW;
END;
$$;

-- Create the trigger that executes the function after a new user is added
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

const rlsSql = `
-- Enable RLS for all tables first
ALTER TABLE "public"."BusinessLocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Customer" ENABLE ROW LEVEL SECURITY;
-- ... repeat for ALL your other tables

-- This is a simple RLS policy. It allows any logged-in user to READ data.
-- All write operations (insert, update, delete) must be handled by backend functions
-- using the 'service_role' key, which bypasses RLS.
CREATE POLICY "Allow authenticated read access" ON "public"."BusinessLocation" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON "public"."Role" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON "public"."User" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON "public"."Product" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON "public"."Customer" FOR SELECT USING (auth.role() = 'authenticated');
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
    "imageUrl" text,
    "originalPrice" double precision
  )
  loop
    insert into "public"."CartItem" ("saleId", "productId", quantity, price, "costPrice", name, sku, "imageUrl", "originalPrice")
    values (new_sale_id, item."productId", item.quantity, item.price, item."costPrice", item.name, item.sku, item."imageUrl", item."originalPrice");

    update "public"."Product"
    set stock = stock - item.quantity
    where id = item."productId";
  end loop;

  return new_sale_id;
end;
$$ language plpgsql volatile;
`;

const DatabaseSetupPage: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">Database & Deployment Guide</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Follow these steps to connect your frontend to a live Supabase database and deploy on Vercel.
                </p>
            </div>
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                     <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Prerequisites</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li>A free account at <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">supabase.com</a> and a new Supabase project.</li>
                            <li>A Vercel account for deploying the project.</li>
                            <li>A Google AI Studio account to get a Gemini <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">API Key</a>.</li>
                        </ul>
                    </div>

                    <Step number={1} title="Create Your Database Tables">
                        <p>First, you need to create all the database tables that the application requires. The simplest way is to run a single SQL script.</p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>In your Supabase project dashboard, navigate to the <strong>SQL Editor</strong>.</li>
                            <li>Click <strong>+ New query</strong>.</li>
                            <li>Copy the full SQL script below, paste it into the editor, and click <strong>RUN</strong>. This will create all necessary tables.</li>
                        </ol>
                        <CodeBlock language="sql">{fullSqlScript}</CodeBlock>
                    </Step>

                    <Step number={2} title="Insert Default Data">
                        <p>Your application needs some initial data to function correctly, like user roles and a default "Walk-in Customer". Run these two scripts in the SQL Editor one by one.</p>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 !mt-4">Script 1: Insert Roles</h4>
                        <CodeBlock language="sql">{insertRolesSql}</CodeBlock>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 !mt-4">Script 2: Insert Other Initial Data</h4>
                        <CodeBlock language="sql">{initialDataSql}</CodeBlock>
                    </Step>

                    <Step number={3} title="Create Database Functions & Triggers">
                        <p>To automate tasks, we'll create functions and triggers in the database.</p>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">New User Trigger</h4>
                        <p>This trigger automatically creates a user profile in your public <code>User</code> table whenever a new user signs up via Supabase Auth.</p>
                        <CodeBlock language="sql">{userTriggerSql}</CodeBlock>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 !mt-4">Sale Transaction Function</h4>
                        <p>This ensures that creating a sale and updating product stock happens as a single, unbreakable operation, preventing data inconsistencies.</p>
                        <CodeBlock language="sql">{saleFunctionSql}</CodeBlock>
                    </Step>
                    
                    <Step number={4} title="Enable Row Level Security (RLS)">
                        <p>RLS is Supabase's core security feature. By default, it blocks all access. We need to create "policies" to allow access. Run this script to enable RLS and create a simple policy that allows any authenticated user to <strong>read</strong> data. All write operations will be handled by our secure backend.</p>
                        <CodeBlock language="sql">{rlsSql}</CodeBlock>
                         <p className="text-sm"><strong>Note:</strong> The script above only creates policies for a few tables. You must repeat the <code>CREATE POLICY...</code> command for every table in your database.</p>
                    </Step>

                    <Step number={5} title="Configure Vercel Environment Variables">
                        <p>For your deployed application to connect to Supabase and Gemini, you must add your secret keys to your Vercel project's environment variables.</p>
                         <p>In your Vercel project dashboard, go to <strong>Settings &gt; Environment Variables</strong> and add the following:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>API_KEY</strong>: Your <strong>Google Gemini API key</strong>. Required for all AI features.</li>
                            <li><strong>SUPABASE_URL</strong>: Your Project URL from Supabase (Settings &gt; API).</li>
                            <li><strong>SUPABASE_ANON_KEY</strong>: Your Project `anon` (public) key from Supabase (Settings &gt; API).</li>
                             <li><strong>SUPABASE_SERVICE_ROLE_KEY</strong>: Your Project `service_role` (secret) key from Supabase (Settings &gt; API). This is critical for the backend to bypass RLS.</li>
                        </ul>
                    </Step>

                     <Step number={6} title="Understanding the Backend" isLast={true}>
                         <p>This project is already structured for a secure Vercel deployment. All backend logic lives in the <code>/api</code> directory as Serverless Functions.</p>
                         <ul className="list-disc pl-5 space-y-2">
                             <li><code>/api/public-config.ts</code>: Provides public Supabase keys to the frontend.</li>
                             <li><code>/api/generate-insights.ts</code> & <code>/api/chat.ts</code>: Securely call the Gemini API.</li>
                             <li><code>/api/app-data.ts</code>: The main data hub. It fetches all initial data for a logged-in user and handles all create/update/delete operations.</li>
                         </ul>
                         <p>The frontend's <code>AuthContext.tsx</code> has been configured to communicate with these endpoints instead of directly with the database or Gemini, ensuring all secret keys and sensitive logic remain on the server.</p>
                    </Step>
                </div>
            </div>
        </div>
    );
};

export default DatabaseSetupPage;
