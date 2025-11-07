

import React, { useState } from 'react';
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

const sqlSchemaContent = `-- This is a PostgreSQL script generated from the Prisma schema.
-- Copy and paste this entire script into your Supabase SQL editor to create all necessary tables.

-- Drop existing types and tables if they exist to start fresh (optional, use with caution)
DROP TABLE IF EXISTS "BrandingSettings", "NotificationTemplate", "IntegrationConnection", "CustomerRequest", "Expense", "ExpenseCategory", "StockTransferRequest", "User", "Role", "StockTransferItem", "StockTransfer", "StockAdjustment", "QuotationItem", "Quotation", "DraftItem", "Draft", "PurchaseReturnItem", "PurchaseReturn", "PurchaseItem", "Purchase", "Shipment", "CustomerReturnItem", "CustomerReturn", "SalePayment", "SaleItem", "Sale", "PaymentMethod", "BankAccount", "Supplier", "Customer", "CustomerGroup", "_ProductToDocuments", "ProductDocument", "Product", "BusinessLocation", "VariationValue", "Variation", "Unit", "Category", "Brand" CASCADE;
DROP TYPE IF EXISTS "BarcodeType", "ProductType", "TaxType", "NotificationType", "NotificationGroup", "SaleStatus", "DiscountType", "StockAdjustmentType", "StockTransferStatus", "StockTransferRequestStatus", "IntegrationProvider";

-- Create ENUM types
CREATE TYPE "BarcodeType" AS ENUM ('CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'UPCE');
CREATE TYPE "ProductType" AS ENUM ('single', 'variable', 'combo');
CREATE TYPE "TaxType" AS ENUM ('percentage', 'fixed');
CREATE TYPE "NotificationType" AS ENUM ('email', 'sms');
CREATE TYPE "NotificationGroup" AS ENUM ('customer', 'supplier');
CREATE TYPE "SaleStatus" AS ENUM ('completed', 'voided', 'return');
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed');
CREATE TYPE "StockAdjustmentType" AS ENUM ('addition', 'subtraction');
CREATE TYPE "StockTransferStatus" AS ENUM ('in_transit', 'completed');
CREATE TYPE "StockTransferRequestStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "IntegrationProvider" AS ENUM ('vendor_api', 'payment_gateway');

-- Create Tables
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL
);

CREATE TABLE "Variation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "VariationValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "variationId" TEXT NOT NULL,
    FOREIGN KEY ("variationId") REFERENCES "Variation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "BusinessLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "reorderPoint" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isNotForSale" BOOLEAN NOT NULL,
    "description" TEXT,
    "productType" "ProductType" NOT NULL,
    "barcodeType" "BarcodeType" NOT NULL,
    "taxAmount" DOUBLE PRECISION,
    "taxType" "TaxType",
    "isAgeRestricted" BOOLEAN,
    "parentProductId" TEXT,
    "variationAttributes" JSONB,
    "brandId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "businessLocationId" TEXT NOT NULL,
    FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("businessLocationId") REFERENCES "BusinessLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("parentProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Product_sku_businessLocationId_key" ON "Product"("sku", "businessLocationId");

CREATE TABLE "ProductDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "_ProductToDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "ProductDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "_ProductToDocuments_AB_unique" ON "_ProductToDocuments"("A", "B");
CREATE INDEX "_ProductToDocuments_B_index" ON "_ProductToDocuments"("B");

CREATE TABLE "CustomerGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "discountPercentage" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "businessName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    FOREIGN KEY ("customerGroupId") REFERENCES "CustomerGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");


CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL
);

CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL
);

CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "accountId" TEXT,
    FOREIGN KEY ("accountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DOUBLE PRECISION NOT NULL,
    "passportNumber" TEXT,
    "nationality" TEXT,
    "status" "SaleStatus",
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "isQueued" BOOLEAN,
    "customerEmailForDocs" TEXT,
    "customerId" TEXT NOT NULL,
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "SalePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" DOUBLE PRECISION NOT NULL,
    "saleId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("methodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "CustomerReturn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "originalSaleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    FOREIGN KEY ("originalSaleId") REFERENCES "Sale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CustomerReturn_originalSaleId_key" ON "CustomerReturn"("originalSaleId");


CREATE TABLE "CustomerReturnItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "customerReturnId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    FOREIGN KEY ("customerReturnId") REFERENCES "CustomerReturn"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shippingAddress" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Shipment_saleId_key" ON "Shipment"("saleId");


CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DOUBLE PRECISION NOT NULL,
    "supplierId" TEXT NOT NULL,
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "PurchaseReturn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DOUBLE PRECISION NOT NULL,
    "supplierId" TEXT NOT NULL,
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "PurchaseReturnItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "purchaseReturnId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    FOREIGN KEY ("purchaseReturnId") REFERENCES "PurchaseReturn"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Draft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DOUBLE PRECISION NOT NULL,
    "customerId" TEXT NOT NULL,
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "DraftItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "draftId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DOUBLE PRECISION NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quotationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "StockAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "StockAdjustmentType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "StockTransfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StockTransferStatus" NOT NULL,
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    FOREIGN KEY ("fromLocationId") REFERENCES "BusinessLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("toLocationId") REFERENCES "BusinessLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "StockTransferItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "stockTransferId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    FOREIGN KEY ("stockTransferId") REFERENCES "StockTransfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" JSONB NOT NULL
);
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "businessLocationId" TEXT NOT NULL,
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("businessLocationId") REFERENCES "BusinessLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "StockTransferRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" INTEGER NOT NULL,
    "status" "StockTransferRequestStatus" NOT NULL DEFAULT 'pending',
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "requestingUserId" TEXT NOT NULL,
    FOREIGN KEY ("fromLocationId") REFERENCES "BusinessLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("toLocationId") REFERENCES "BusinessLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("requestingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "CustomerRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "cashierName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" "IntegrationProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL
);

CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "group" "NotificationGroup" NOT NULL
);

CREATE TABLE "BrandingSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "businessName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT
);

-- Note: Prisma uses cuid() which doesn't have a direct equivalent in PostgreSQL.
-- TEXT is used here for simplicity. For production, you might want to use UUIDs with functions like uuid_generate_v4().
-- Also, implicit many-to-many relation tables like "_ProductToDocuments" are made explicit here.
`;


const DeploymentPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const [copyText, setCopyText] = useState('Copy');

    const handleCopy = () => {
        navigator.clipboard.writeText(sqlSchemaContent);
        setCopyText('Copied!');
        setTimeout(() => setCopyText('Copy'), 2000);
    };

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
    
    const highlightClass = "bg-yellow-300 text-black dark:bg-yellow-400 px-1 rounded";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">Deployment Guide</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Follow these steps to set up a real database on Supabase for your application.
                </p>
            </div>
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">What You'll Need</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li>A free account at <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">supabase.com</a>.</li>
                             <li>A new Supabase project created in your account.</li>
                        </ul>
                    </div>

                    <Step number={1} title="Navigate to the SQL Editor in Supabase">
                        <p>
                            Once you have created a project in Supabase, navigate to your project's dashboard. On the left-hand sidebar, find and click on the <strong>SQL Editor</strong> icon (it looks like a database cylinder with "SQL" on it).
                        </p>
                    </Step>
                    
                    <Step number={2} title="Prepare the Database Schema">
                        <p>
                            The block below contains the complete SQL script needed to create all the tables, types, and relationships for this POS application. This script is written in PostgreSQL, which is what Supabase uses.
                        </p>
                         <p className="text-sm text-slate-500">
                            The error you previously encountered (<code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">syntax error at or near "//"</code>) happened because the previous block contained a Prisma Schema, not a runnable SQL script. SQL doesn't understand Prisma's syntax. This new block contains the correct SQL code.
                        </p>
                    </Step>

                    <Step number={3} title="Copy & Run the SQL Script">
                        <p>Click the "Copy" button below to copy the entire SQL script to your clipboard.</p>
                         <div className="relative my-4">
                            <textarea
                                readOnly
                                className="w-full h-80 font-mono text-sm bg-slate-800 dark:bg-black/50 text-slate-100 rounded-lg p-4 resize-y border-0 ring-1 ring-slate-700"
                                value={sqlSchemaContent}
                                aria-label="PostgreSQL Schema Content"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="absolute top-3 right-3 px-3 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded text-white"
                            >
                                {copyText}
                            </button>
                        </div>
                        <p>
                            Now, paste this script into the Supabase SQL Editor you opened in Step 1. Click the <strong>"Run"</strong> button (or press `Cmd+Enter` / `Ctrl+Enter`).
                        </p>
                         <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 rounded-r-lg">
                            <p className="text-sm text-green-800 dark:text-green-300">
                                <strong className="font-semibold">Success!</strong> If the query runs without errors, your database is now ready. You can go to the "Table Editor" in Supabase to see all the newly created tables.
                            </p>
                        </div>
                    </Step>
                    
                    <Step number={4} title="Connect Your Backend" isLast={true}>
                         <p>
                            Your database is now structured correctly. The next step is to build a backend application (e.g., using Node.js with Express or a serverless function) that will connect to this Supabase database. This backend will handle all the application's logic, like adding a new product or processing a sale, by running SQL queries against these tables.
                        </p>
                        <p>
                            You will need to get your database connection string from the Supabase dashboard (under <strong>Project Settings &gt; Database</strong>) and use it in your backend's environment variables.
                        </p>
                    </Step>
                </div>
            </div>
        </div>
    );
};

export default DeploymentPage;
