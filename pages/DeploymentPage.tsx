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
            <div className="flex-1 w-px bg-slate-300 dark:bg-slate-600 my-2"></div>
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
                    <Step number={1} title="Prerequisites">
                        <p>Before you begin, ensure you have the following installed on your system:</p>
                        <ul className="list-disc pl-5">
                            <li><strong>Node.js:</strong> Version 18.x or higher. You can download it from <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">nodejs.org</a>.</li>
                            <li><strong>npm</strong> (Node Package Manager): This is installed automatically with Node.js.</li>
                        </ul>
                    </Step>
                    
                    <Step number={2} title="Project Setup">
                        <p>First, obtain the project files and install the necessary dependencies.</p>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">2a. Get the Project Files</h4>
                        <p>If you have a git repository, clone it. Otherwise, ensure you have the project folder on your machine.</p>
                        <CodeBlock>{`git clone <repository-url>\ncd <project-folder>`}</CodeBlock>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">2b. Install Dependencies</h4>
                        <p>Open your terminal in the project's root directory and run the following command:</p>
                        <CodeBlock>{`npm install`}</CodeBlock>
                        <p>This will download all the required libraries for the application to run.</p>
                    </Step>
                    
                    <Step number={3} title="Environment Configuration">
                        <p>The application requires an API key for Google Gemini to function correctly. This is configured using an environment variable.</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3a. Create a .env file</h4>
                        <p>In the root directory of the project, create a new file named <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code>.</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">3b. Add Your Gemini API Key</h4>
                        <p>Open the <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">.env</code> file and add the following line, replacing <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">"YOUR_GEMINI_API_KEY"</code> with your actual key from Google AI Studio.</p>
                        <CodeBlock>API_KEY="YOUR_GEMINI_API_KEY"</CodeBlock>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300">
                            <p className="font-bold">Important:</p>
                            <p>Never commit the <code className="font-mono">.env</code> file to a public repository. It should be listed in your <code className="font-mono">.gitignore</code> file to protect your secret keys.</p>
                        </div>
                    </Step>
                    
                    <Step number={4} title="Run the Application">
                        <p>With everything configured, you can now start the local development server.</p>
                        <p>Run the following command in your terminal:</p>
                        <CodeBlock>{`npm run dev`}</CodeBlock>
                        <p>The terminal will output a local URL, typically <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">http://localhost:5173</a> or a similar address.</p>
                    </Step>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0 flex flex-col items-center">
                             <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold text-lg">
                                &#10003;
                            </span>
                        </div>
                        <div className="flex-1">
                             <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Done!</h3>
                             <p>Open the URL provided in your terminal in a web browser. The application should now be running locally on your machine. Congratulations!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeploymentPage;
