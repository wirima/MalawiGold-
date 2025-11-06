

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 dark:bg-black/50 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <code>
            {children}
        </code>
    </pre>
);

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex gap-6">
        <div className="flex-shrink-0 flex flex-col items-center">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg">
                {number}
            </span>
            {/* Render line only if it's not the last step */}
            {number < 6 && <div className="flex-1 w-px bg-slate-300 dark:bg-slate-600 my-2"></div>}
        </div>
        <div className="flex-1 pb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-slate-600 dark:text-slate-300">
                {children}
            </div>
        </div>
    </div>
);

const prismaSchemaContent = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Brand {
  id       String    @id @default(cuid())
  name     String
  products Product[]
}

model Category {
  id       String    @id @default(cuid())
  name     String
  products Product[]
}

model Unit {
  id        String    @id @default(cuid())
  name      String
  shortName String
  products  Product[]
}

model Variation {
  id     String           @id @default(cuid())
  name   String
  values VariationValue[]
}

model VariationValue {
  id          String    @id @default(cuid())
  name        String
  variation   Variation @relation(fields: [variationId], references: [id])
  variationId String
}

enum BarcodeType {
  CODE128
  CODE39
  EAN13
  EAN8
  UPC
  UPCE
}

enum ProductType {
  single
  variable
  combo
}

enum TaxType {
  percentage
  fixed
}

model Product {
  id                  String               @id @default(cuid())
  name                String
  sku                 String
  costPrice           Float
  price               Float
  stock               Int
  reorderPoint        Int
  imageUrl            String
  isNotForSale        Boolean
  description         String?
  productType         ProductType
  barcodeType         BarcodeType
  taxAmount           Float?
  taxType             TaxType?
  isAgeRestricted     Boolean?
  parentProductId     String?
  variationAttributes Json?

  brand              Brand              @relation(fields: [brandId], references: [id])
  brandId            String
  category           Category           @relation(fields: [categoryId], references: [id])
  categoryId         String
  unit               Unit               @relation(fields: [unitId], references: [id])
  unitId             String
  businessLocation   BusinessLocation   @relation(fields: [businessLocationId], references: [id])
  businessLocationId String

  parent   Product?  @relation("ProductVariants", fields: [parentProductId], references: [id])
  variants Product[] @relation("ProductVariants")

  stockAdjustments      StockAdjustment[]
  documents             ProductDocument[]      @relation("ProductToDocuments")
  SaleItem              SaleItem[]
  PurchaseItem          PurchaseItem[]
  DraftItem             DraftItem[]
  QuotationItem         QuotationItem[]
  StockTransferItem     StockTransferItem[]
  CustomerReturnItem    CustomerReturnItem[]
  PurchaseReturnItem    PurchaseReturnItem[]
  stockTransferRequests StockTransferRequest[]

  @@unique([sku, businessLocationId])
}

model ProductDocument {
  id           String    @id @default(cuid())
  name         String
  description  String
  fileUrl      String
  fileName     String
  fileType     String // 'coa' or 'warranty'
  uploadedDate DateTime  @default(now())
  products     Product[] @relation("ProductToDocuments")
}

model CustomerGroup {
  id                 String     @id @default(cuid())
  name               String
  discountPercentage Float
  customers          Customer[]
}

model Customer {
  id              String           @id @default(cuid())
  name            String
  businessName    String?
  email           String           @unique
  phone           String
  address         String
  customerGroup   CustomerGroup    @relation(fields: [customerGroupId], references: [id])
  customerGroupId String
  sales           Sale[]
  drafts          Draft[]
  quotations      Quotation[]
  customerReturns CustomerReturn[]
}

model Supplier {
  id              String           @id @default(cuid())
  name            String
  businessName    String
  email           String
  phone           String
  address         String
  purchases       Purchase[]
  purchaseReturns PurchaseReturn[]
}

model BankAccount {
  id             String          @id @default(cuid())
  accountName    String
  bankName       String
  accountNumber  String
  paymentMethods PaymentMethod[]
}

model PaymentMethod {
  id          String       @id @default(cuid())
  name        String
  account     BankAccount? @relation(fields: [accountId], references: [id])
  accountId   String?
  SalePayment SalePayment[]
}

enum SaleStatus {
  completed
  voided
  return
}

enum DiscountType {
  percentage
  fixed
}

model Sale {
  id                   String        @id @default(cuid())
  date                 DateTime      @default(now())
  total                Float
  passportNumber       String?
  nationality          String?
  status               SaleStatus?
  discountType         DiscountType?
  discountValue        Float?
  isQueued             Boolean?
  customerEmailForDocs String?
  customer             Customer      @relation(fields: [customerId], references: [id])
  customerId           String
  items                SaleItem[]
  payments             SalePayment[]
  shipment             Shipment?
  customerReturn       CustomerReturn?
}

model SaleItem {
  id            String  @id @default(cuid())
  quantity      Int
  price         Float // price at time of sale
  costPrice     Float // cost at time of sale
  originalPrice Float?
  sale          Sale    @relation(fields: [saleId], references: [id])
  saleId        String
  product       Product @relation(fields: [productId], references: [id])
  productId     String
}

model SalePayment {
  id            String        @id @default(cuid())
  amount        Float
  sale          Sale          @relation(fields: [saleId], references: [id])
  saleId        String
  paymentMethod PaymentMethod @relation(fields: [methodId], references: [id])
  methodId      String
}

model CustomerReturn {
  id             String               @id @default(cuid())
  date           DateTime             @default(now())
  reason         String
  total          Float
  originalSale   Sale                 @relation(fields: [originalSaleId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  originalSaleId String               @unique
  customer       Customer             @relation(fields: [customerId], references: [id])
  customerId     String
  items          CustomerReturnItem[]
}

model CustomerReturnItem {
  id               String         @id @default(cuid())
  quantity         Int
  price            Float
  customerReturn   CustomerReturn @relation(fields: [customerReturnId], references: [id])
  customerReturnId String
  product          Product        @relation(fields: [productId], references: [id])
  productId        String
}

model Shipment {
  id              String @id @default(cuid())
  shippingAddress String
  trackingNumber  String
  status          String // 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  sale            Sale   @relation(fields: [saleId], references: [id])
  saleId          String @unique
}

model Purchase {
  id         String         @id @default(cuid())
  date       DateTime       @default(now())
  total      Float
  supplier   Supplier       @relation(fields: [supplierId], references: [id])
  supplierId String
  items      PurchaseItem[]
}

model PurchaseItem {
  id         String   @id @default(cuid())
  quantity   Int
  price      Float // purchase price
  purchase   Purchase @relation(fields: [purchaseId], references: [id])
  purchaseId String
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
}

model PurchaseReturn {
  id              String               @id @default(cuid())
  date            DateTime             @default(now())
  total           Float
  supplier        Supplier             @relation(fields: [supplierId], references: [id])
  supplierId      String
  items           PurchaseReturnItem[]
}

model PurchaseReturnItem {
  id               String         @id @default(cuid())
  quantity         Int
  price            Float
  purchaseReturn   PurchaseReturn @relation(fields: [purchaseReturnId], references: [id])
  purchaseReturnId String
  product          Product        @relation(fields: [productId], references: [id])
  productId        String
}

model Draft {
  id         String      @id @default(cuid())
  date       DateTime    @default(now())
  total      Float
  customer   Customer    @relation(fields: [customerId], references: [id])
  customerId String
  items      DraftItem[]
}

model DraftItem {
  id        String  @id @default(cuid())
  quantity  Int
  price     Float
  draft     Draft   @relation(fields: [draftId], references: [id])
  draftId   String
  product   Product @relation(fields: [productId], references: [id])
  productId String
}

model Quotation {
  id         String          @id @default(cuid())
  date       DateTime        @default(now())
  total      Float
  expiryDate DateTime
  customer   Customer        @relation(fields: [customerId], references: [id])
  customerId String
  items      QuotationItem[]
}

model QuotationItem {
  id          String    @id @default(cuid())
  quantity    Int
  price       Float
  quotation   Quotation @relation(fields: [quotationId], references: [id])
  quotationId String
  product     Product   @relation(fields: [productId], references: [id])
  productId   String
}

enum StockAdjustmentType {
  addition
  subtraction
}

model StockAdjustment {
  id        String              @id @default(cuid())
  date      DateTime            @default(now())
  type      StockAdjustmentType
  quantity  Int
  reason    String
  product   Product             @relation(fields: [productId], references: [id])
  productId String
}

model BusinessLocation {
  id                         String                 @id @default(cuid())
  name                       String
  users                      User[]
  products                   Product[]
  stockTransferFrom          StockTransfer[]        @relation("FromLocation")
  stockTransferTo            StockTransfer[]        @relation("ToLocation")
  stockTransferRequestFrom   StockTransferRequest[] @relation("RequestFromLocation")
  stockTransferRequestTo     StockTransferRequest[] @relation("RequestToLocation")
}

enum StockTransferStatus {
  in_transit
  completed
}

model StockTransfer {
  id             String              @id @default(cuid())
  date           DateTime            @default(now())
  status         StockTransferStatus
  fromLocation   BusinessLocation    @relation("FromLocation", fields: [fromLocationId], references: [id])
  fromLocationId String
  toLocation     BusinessLocation    @relation("ToLocation", fields: [toLocationId], references: [id])
  toLocationId   String
  items          StockTransferItem[]
}

model StockTransferItem {
  id              String        @id @default(cuid())
  quantity        Int
  stockTransfer   StockTransfer @relation(fields: [stockTransferId], references: [id])
  stockTransferId String
  product         Product       @relation(fields: [productId], references: [id])
  productId       String
}

enum StockTransferRequestStatus {
  pending
  approved
  rejected
}

model StockTransferRequest {
  id               String                     @id @default(cuid())
  date             DateTime                   @default(now())
  quantity         Int
  status           StockTransferRequestStatus @default(pending)
  fromLocationId   String
  toLocationId     String
  productId        String
  requestingUserId String

  fromLocation   BusinessLocation @relation("RequestFromLocation", fields: [fromLocationId], references: [id])
  toLocation     BusinessLocation @relation("RequestToLocation", fields: [toLocationId], references: [id])
  product        Product          @relation(fields: [productId], references: [id])
  requestingUser User             @relation(fields: [requestingUserId], references: [id])
}

model ExpenseCategory {
  id       String    @id @default(cuid())
  name     String
  expenses Expense[]
}

model Expense {
  id          String          @id @default(cuid())
  date        DateTime        @default(now())
  amount      Float
  description String
  category    ExpenseCategory @relation(fields: [categoryId], references: [id])
  categoryId  String
}

model CustomerRequest {
  id          String   @id @default(cuid())
  text        String
  cashierId   String
  cashierName String
  date        DateTime @default(now())
}

enum IntegrationProvider {
  vendor_api
  payment_gateway
}

model IntegrationConnection {
  id       String              @id @default(cuid())
  provider IntegrationProvider
  name     String
  config   Json
}

model Role {
  id          String @id @default(cuid())
  name        String @unique
  description String
  permissions Json // Array of Permission strings
  users       User[]
}

model User {
  id                    String                 @id @default(cuid())
  name                  String
  email                 String                 @unique
  role                  Role                   @relation(fields: [roleId], references: [id])
  roleId                String
  businessLocation      BusinessLocation       @relation(fields: [businessLocationId], references: [id])
  businessLocationId    String
  stockTransferRequests StockTransferRequest[]
}

model BrandingSettings {
  id           Int     @id @default(1)
  businessName String
  logoUrl      String?
  address      String?
  phone        String?
  website      String?
}
`;

const DeploymentPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const [copyText, setCopyText] = useState('Copy');

    const handleCopy = () => {
        navigator.clipboard.writeText(prismaSchemaContent);
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
                    Follow these steps to set up and run this application on your local machine and deploy it to a hosting service.
                </p>
            </div>
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">What You'll Need</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Node.js (LTS version):</strong> The JavaScript runtime. Get it from <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">nodejs.org</a>.</li>
                            <li><strong>Git (Optional):</strong> For cloning the project repository. <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Get Git</a>.</li>
                            <li><strong>Google Gemini API Key:</strong> Required for AI features. Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Google AI Studio</a>.</li>
                        </ul>
                    </div>

                    <Step number={1} title="Prerequisites: Set Up Your Node.js Environment">
                        <p>This application is built with modern web technologies that require a JavaScript runtime environment called Node.js. It's like the engine that powers the application.</p>

                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">1a. Download and Install Node.js</h4>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                Navigate to the official Node.js website: <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">nodejs.org</a>.
                            </li>
                            <li>
                                Download the installer for the <strong>LTS (Long-Term Support)</strong> version (e.g., v18.x or higher). This version is the most stable and is recommended for most users.
                            </li>
                            <li>
                                Run the installer you just downloaded and follow the on-screen instructions. The default settings are usually sufficient for most setups.
                            </li>
                        </ul>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">1b. Verify the Installation</h4>
                        <p>Once the installation is complete, you can verify that Node.js and its package manager (npm) are correctly installed. Open your terminal or command prompt and run the following commands one by one:</p>
                        <CodeBlock>{`# Check Node.js version
node -v

# Check npm version
npm -v`}</CodeBlock>
                        <p>If the commands return version numbers (e.g., `v18.18.0`), your environment is ready! <strong>npm</strong> is installed automatically with Node.js. If you get an error, please try restarting your terminal or your computer, or reinstalling Node.js.</p>
                         <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 rounded-r-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong className="font-semibold">Note:</strong> For developers who work on multiple projects, using a Node Version Manager (like nvm or n) is highly recommended. It allows you to easily switch between different Node.js versions.
                            </p>
                        </div>
                    </Step>
                    
                    <Step number={2} title="Project Setup: Getting the Code">
                        <p>First, you need to get a copy of the project files on your computer and install its dependencies.</p>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">2a. Download the Project Files</h4>
                        <p>The easiest way is to use Git. Open your terminal (like Command Prompt on Windows or Terminal on Mac) and run the following commands. This will create a folder called `gemini-pos-system` with all the app's code.</p>
                        <CodeBlock>{'git clone '}<span className={highlightClass}>https://github.com/example-org/gemini-pos-system.git</span>{`
cd gemini-pos-system`}</CodeBlock>
                        <p className="mt-2 text-sm text-slate-500"><strong>Note:</strong> The repository URL is a placeholder. <span className={highlightClass}>Replace it with your project's actual repository URL</span>.</p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 rounded-r-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong className="font-semibold">Note:</strong> If you don't have Git installed, you can usually download the project's source code as a ZIP file from the repository homepage.
                            </p>
                        </div>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">2b. Install Dependencies</h4>
                        <p>Once you are inside the project folder, run this command. It reads a list of all the tools the app needs (like React for the user interface) and downloads them. This might take a minute or two.</p>
                        <CodeBlock>{`npm install`}</CodeBlock>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 rounded-r-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong className="font-semibold">Note:</strong> The <code>npm install</code> command looks at a file called <code>package.json</code>, which contains a list of all the libraries and tools (called dependencies) the project needs to run. It then downloads and installs them into a folder called <code>node_modules</code>.
                            </p>
                        </div>
                    </Step>

                    <Step number={3} title="(Optional) Setting Up a Local Database">
                        <p>By default, this application runs with mock data for demonstration purposes. For a real-world application, you'll want to connect to a database to persist your data. This guide shows how to set up a simple local <strong>SQLite</strong> database using <strong>Prisma</strong>.</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3a. Install Prisma CLI</h4>
                        <p>Prisma is a modern database toolkit. Install its command-line tool as a development dependency:</p>
                        <CodeBlock>{`npm install prisma --save-dev`}</CodeBlock>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3b. Initialize Prisma with SQLite</h4>
                        <p>This command creates a new `prisma` directory and a `prisma/schema.prisma` file, and configures your project for a SQLite database:</p>
                        <CodeBlock>{`npx prisma init --datasource-provider sqlite`}</CodeBlock>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3c. Define Your Database Schema</h4>
                        <p>Open the new file at <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">prisma/schema.prisma</code>. Delete its contents and replace it with the complete schema provided below. This schema mirrors all the data structures used in the application.</p>
                         <div className="relative my-4">
                            <textarea
                                readOnly
                                className="w-full h-80 font-mono text-sm bg-slate-800 dark:bg-black/50 text-slate-100 rounded-lg p-4 resize-y border-0 ring-1 ring-slate-700"
                                defaultValue={prismaSchemaContent}
                                aria-label="Prisma Schema Content"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="absolute top-3 right-3 px-3 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded text-white"
                            >
                                {copyText}
                            </button>
                        </div>

                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3d. Run the Database Migration</h4>
                        <p>This command creates your SQLite database file (e.g., `prisma/dev.db`) based on your schema and generates the Prisma Client, a type-safe library for database access.</p>
                        <CodeBlock>{`npx prisma migrate dev --name init`}</CodeBlock>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3e. Connect Your Application</h4>
                        <p>With the database set up, the final step is to replace the mock data usage in the application. For example, in `src/contexts/AuthContext.tsx`, you would import the Prisma Client and use it to fetch and update data instead of using the mock data arrays. This is a conceptual example of how you would fetch products:</p>
                        <CodeBlock>{`// In a new backend service file or context:
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function getProducts() {
  return await prisma.product.findMany();
}`}</CodeBlock>
                    </Step>
                    
                    <Step number={4} title="Configuration: Connecting to the AI">
                        <p>This POS system uses Google's powerful Gemini AI for features like "Smart Business Insights". To use these features, the application needs a secret API Key. You can get your key from the official resource:</p>
                        <p><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Get a Google Gemini API Key</a></p>
                        <p className="mt-2">How you provide this key depends on whether you are running the app locally or on a hosting service.</p>

                        <div className="mt-4 p-4 bg-yellow-200 dark:bg-yellow-700/60 rounded-lg text-black">
                            <p className="font-bold">Important: Keep Your Key Secret!</p>
                            <p>Your API key is like a password. Never share it publicly or commit it to your Git repository. The methods below are designed to keep secrets like this safe.</p>
                        </div>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">4a. For Local Development</h4>
                        <p>When running the app on your own computer, you use a special file named <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code> to store the key.</p>
                        <ul className="list-decimal pl-5 space-y-2">
                          <li>In the project's main folder, create a new file and name it exactly <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code>.</li>
                          <li>Open the file and add the following line, replacing the highlighted placeholder with your actual key.</li>
                        </ul>
                        <CodeBlock>{'API_KEY="'}<span className={highlightClass}>AIzaSy...your...actual...key...here</span>{'"'}</CodeBlock>

                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">4b. For Deployed Environments (Staging, Production)</h4>
                        <p>When you deploy your app to a hosting service (like Vercel, Netlify, AWS, etc.), the <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code> file is not uploaded. Instead, you must configure the API key directly in your hosting provider's dashboard.</p>
                         <ul className="list-disc pl-5 space-y-2">
                           <li>Log in to your hosting provider's website.</li>
                           <li>Navigate to your project's settings page.</li>
                           <li>Look for a section named <strong>"Environment Variables"</strong>.</li>
                           <li>Add a new variable with the name (or "key") <code className={`${highlightClass} text-sm font-semibold`}>API_KEY</code>.</li>
                           <li><span className={highlightClass}>Paste your Gemini API key</span> into the value field.</li>
                           <li>Save the variable and redeploy your application for the changes to take effect.</li>
                        </ul>

                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">4c. Troubleshooting the "Failed to generate business insights" Error</h4>
                        <p>If you see an error like <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">"Failed to generate business insights. Please check the API configuration"</code>, especially in a deployed environment like "staging", it almost always means there's an issue with the API key configuration for that environment.</p>
                         <ul className="list-disc pl-5 space-y-2">
                           <li><strong>Check the Staging Environment Variables:</strong> Re-visit your hosting provider's dashboard for your staging site and confirm that the <code className={`${highlightClass} text-sm font-semibold`}>API_KEY</code> variable exists and its value is correct. A common mistake is adding the key to the production environment but not the staging one.</li>
                           <li><strong>Check for Typos:</strong> Ensure the variable name is exactly <code className={`${highlightClass} text-sm font-semibold`}>API_KEY</code> (all uppercase) and that the key value has no extra spaces or characters.</li>
                           <li><strong>Check API Permissions:</strong> Ensure the API key you are using has the Gemini API enabled in your Google Cloud project and that billing is set up correctly.</li>
                        </ul>
                    </Step>
                    
                    <Step number={5} title="Run the Application">
                        <p>Now you're ready to start the app! This command starts a "development server," which is like a mini web server running just on your computer.</p>
                        <p>Run the following command in your terminal:</p>
                        <CodeBlock>{`npm run dev`}</CodeBlock>
                        <p>The terminal will show some messages and then display something like this, indicating the app is running:</p>
                        <CodeBlock>{`  VITE v5.3.3  ready in 385 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`}</CodeBlock>
                         <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 rounded-r-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong className="font-semibold">Note:</strong> The development server automatically watches for any changes you make to the code files. When you save a file, it will instantly update the application in your browser, making development much faster.
                            </p>
                        </div>
                    </Step>

                    <Step number={6} title="View Your App!">
                        <p>Open your web browser (like Chrome, Firefox, or Safari) and go to the "Local" address shown in your terminal. It's usually:</p>
                        <p><a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">http://localhost:5173</a></p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 rounded-r-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong className="font-semibold">Note:</strong> If port 5173 is already being used by another application on your computer, the tool will automatically pick the next available port (e.g., 5174). Just use the URL provided in your terminal.
                            </p>
                        </div>
                        <p>You should now see the Gemini POS application running in your browser! You can switch between users like 'Alice Admin' or 'Casey Cashier' to explore all the features. Congratulations!</p>
                         <div className="flex-shrink-0 flex items-center justify-center pt-4">
                             <span className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                    </Step>
                </div>
            </div>
        </div>
    );
};

export default DeploymentPage;