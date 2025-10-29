import React from 'react';
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


const DeploymentPage: React.FC = () => {
    const { hasPermission } = useAuth();

    if (!hasPermission('settings:view')) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to view this page.
                </p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">Deployment Guide</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Follow these steps to set up and run this application on your local machine.
                </p>
            </div>
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
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
                    </Step>
                    
                    <Step number={2} title="Project Setup: Getting the Code">
                        <p>First, you need to get a copy of the project files on your computer and install its dependencies.</p>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">2a. Download the Project Files</h4>
                        <p>The easiest way is to use Git. Open your terminal (like Command Prompt on Windows or Terminal on Mac) and run the following commands. This will create a folder called `gemini-pos-system` with all the app's code.</p>
                        <CodeBlock>{`git clone https://github.com/example-org/gemini-pos-system.git
cd gemini-pos-system`}</CodeBlock>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">2b. Install Dependencies</h4>
                        <p>Once you are inside the project folder, run this command. It reads a list of all the tools the app needs (like React for the user interface) and downloads them. This might take a minute or two.</p>
                        <CodeBlock>{`npm install`}</CodeBlock>
                    </Step>

                    <Step number={3} title="(Optional) Setting Up a Local Database">
                        <p>By default, this application runs with mock data for demonstration purposes (you can see it in `src/data/mockData.ts`). For a real-world application, you'll want to connect to a database to persist your data. This guide shows how to set up a simple local <strong>SQLite</strong> database using <strong>Prisma</strong>.</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3a. Install Prisma CLI</h4>
                        <p>Prisma is a modern database toolkit. Install its command-line tool as a development dependency:</p>
                        <CodeBlock>{`npm install prisma --save-dev`}</CodeBlock>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3b. Initialize Prisma with SQLite</h4>
                        <p>This command creates a new `prisma` directory and configures your project for a SQLite database:</p>
                        <CodeBlock>{`npx prisma init --datasource-provider sqlite`}</CodeBlock>
                        <p>This will also update your `.env` file with a `DATABASE_URL` pointing to a local database file.</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3c. Define Your Database Schema</h4>
                        <p>Open `prisma/schema.prisma` and define your data models. For example, to create a `Product` table, you could add this model:</p>
                        <CodeBlock>{`model Product {
  id          String   @id @default(cuid())
  name        String
  sku         String   @unique
  price       Float
  costPrice   Float
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}`}</CodeBlock>
                        
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
                        <p>This POS system uses Google's powerful Gemini AI for features like "Smart Business Insights" on the dashboard. To use these features, the application needs a special password, called an API Key.</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">4a. Create a `.env` file</h4>
                        <p>In the project's main folder (where you see files like `index.html`), create a new file and name it exactly <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code>. The dot at the beginning is important!</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">4b. Add Your Gemini API Key</h4>
                        <p>Open the new <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code> file and add the following line. Replace the placeholder with your actual key from Google AI Studio.</p>
                        <CodeBlock>API_KEY="AIzaSy...your...actual...key...here"</CodeBlock>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300">
                            <p className="font-bold">Important: Keep Your Key Secret!</p>
                            <p>Your API key is like a password. Never share it publicly. The <code className="font-mono">.env</code> file is designed to keep secrets like this safe and out of your public code.</p>
                        </div>
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
                    </Step>

                    <Step number={6} title="View Your App!">
                        <p>Open your web browser (like Chrome, Firefox, or Safari) and go to the "Local" address shown in your terminal. It's usually:</p>
                        <p><a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">http://localhost:5173</a></p>
                        <p>You should now see the Gemini POS application running in your browser! You can switch between users like 'Alice Admin' or 'Casey Cashier' to explore all the features. Congratulations!</p>
                         <div className="flex-shrink-0 flex items-center justify-center pt-4">
                             <span className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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