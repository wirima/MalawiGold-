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
            {number < 5 && <div className="flex-1 w-px bg-slate-300 dark:bg-slate-600 my-2"></div>}
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
                    <Step number={1} title="Prerequisites: The Tools You'll Need">
                        <p>Before you begin, ensure you have the following installed on your system. Think of these as the basic workshop tools needed to build and run the application.</p>
                        <ul className="list-disc pl-5">
                            <li>
                                <strong>Node.js:</strong> This is the engine that runs the application's code. Version 18.x or higher is recommended. You can download it from <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">nodejs.org</a>.
                            </li>
                            <li>
                                <strong>npm (Node Package Manager):</strong> This is a tool that helps manage all the building blocks (or 'packages') the application needs. It's installed automatically when you install Node.js.
                            </li>
                        </ul>
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
                    
                    <Step number={3} title="Configuration: Connecting to the AI">
                        <p>This POS system uses Google's powerful Gemini AI for features like "Smart Business Insights" on the dashboard. To use these features, the application needs a special password, called an API Key.</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3a. Create a `.env` file</h4>
                        <p>In the project's main folder (where you see files like `index.html`), create a new file and name it exactly <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code>. The dot at the beginning is important!</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3b. Add Your Gemini API Key</h4>
                        <p>Open the new <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code> file and add the following line. Replace the placeholder with your actual key from Google AI Studio.</p>
                        <CodeBlock>API_KEY="AIzaSy...your...actual...key...here"</CodeBlock>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300">
                            <p className="font-bold">Important: Keep Your Key Secret!</p>
                            <p>Your API key is like a password. Never share it publicly. The <code className="font-mono">.env</code> file is designed to keep secrets like this safe and out of your public code.</p>
                        </div>
                    </Step>
                    
                    <Step number={4} title="Run the Application">
                        <p>Now you're ready to start the app! This command starts a "development server," which is like a mini web server running just on your computer.</p>
                        <p>Run the following command in your terminal:</p>
                        <CodeBlock>{`npm run dev`}</CodeBlock>
                        <p>The terminal will show some messages and then display something like this, indicating the app is running:</p>
                        <CodeBlock>{`  VITE v5.3.3  ready in 385 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`}</CodeBlock>
                    </Step>

                    <Step number={5} title="View Your App!">
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
