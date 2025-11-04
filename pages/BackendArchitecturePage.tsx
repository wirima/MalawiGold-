
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Step: React.FC<{ number: number; title: string; isLast?: boolean; children: React.ReactNode }> = ({ number, title, isLast, children }) => (
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

const BackendArchitecturePage: React.FC = () => {
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
                <h1 className="text-2xl font-bold">Backend Integration Platform Design</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    A guide to designing and building the backend services required for payment and vendor integrations.
                </p>
            </div>
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Core Principles</h3>
                        <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                            <li><strong>Secure by Design:</strong> Isolate sensitive logic and credentials on a dedicated backend server. The frontend should only be a user interface.</li>
                            <li><strong>Clutter-Free and Intuitive:</strong> Guide the user through setup with a clear, step-by-step process. Avoid technical jargon where possible.</li>
                            <li><strong>Discoverable and Informative:</strong> Create a central "marketplace" where users can browse available integrations and understand their benefits.</li>
                            <li><strong>Modular and Scalable:</strong> Design the system to easily accommodate new integrations (e.g., Shipping, Accounting) without major rework.</li>
                            <li><strong>Transparent and Manageable:</strong> Provide users with clear status indicators, logs, and controls for their active integrations.</li>
                        </ol>
                    </div>

                    <Step number={1} title="Proposed UI/UX & User Flow">
                        <p>A new section under <strong>Settings &gt; Integrations</strong> will serve as the central hub for connecting your POS to external services.</p>

                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">The Integrations Hub (The "Marketplace")</h4>
                        <p>This is the main landing page, presenting integrations in a clean, card-based gallery layout.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Organization:</strong> Group integrations into categories like Payment Gateways, Accounting, Shipping, and Suppliers.</li>
                            <li><strong>Integration Card:</strong> Each card should show the service's logo, name, a one-line description, and a status-based button ("Connect", "Manage", or "Coming Soon").</li>
                        </ul>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">The Integration Setup Wizard</h4>
                        <p>Clicking "Connect" launches a guided modal to handle the setup process securely and intuitively.</p>
                        <ol className="list-decimal pl-5 space-y-2">
                           <li><strong>Step 1: Introduction:</strong> Explain the integration's purpose and list any prerequisites (e.g., "You will need an active Stripe account and your API keys.").</li>
                           <li><strong>Step 2: Secure Credential Entry:</strong> Provide a simple form for API keys. Secret keys must be entered into a password-type field, with a clear warning that the key will be securely stored and never displayed again.</li>
                           <li><strong>Step 3: Connection & Verification:</strong> On submission, the frontend sends credentials to your backend. The backend encrypts the secret, saves it, and makes a test API call to the vendor. It then returns a simple success or failure message to the UI.</li>
                        </ol>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">Managing Active Integrations</h4>
                        <p>After connecting, the "Manage" view provides a dashboard for each integration.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Status Display:</strong> Show a large `Active` or `Error` badge, connection details, and non-sensitive information.</li>
                            <li><strong>User Actions:</strong> Include buttons for a "Health Check" (to re-verify credentials), "View Logs", an "Enable/Disable" toggle, and a "Delete Connection" option.</li>
                        </ul>
                    </Step>
                    
                    <Step number={2} title="Required Backend Architecture" isLast={true}>
                        <p>This frontend design relies on a robust and secure backend with several key components. This backend must be built as a separate server application (e.g., using Node.js, Python, Go, etc.).</p>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Secure Storage</h4>
                         <p>A dedicated <code>integrations</code> table in your database is necessary to store:</p>
                         <ul className="list-disc pl-5 space-y-2">
                            <li>The integration type (e.g., 'stripe', 'quickbooks').</li>
                            <li>User-provided configuration (e.g., display name, non-sensitive keys).</li>
                            <li><strong>Encrypted API credentials</strong>. Never store secret keys in plaintext.</li>
                        </ul>
                        
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">Dedicated API Endpoints</h4>
                        <p>Your backend must expose a set of RESTful endpoints for the frontend to call. These endpoints handle all the logic.</p>
                        <pre className="bg-slate-800 dark:bg-black/50 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto"><code>{
`// To securely save new credentials and run an initial test.
POST /api/integrations

// To get a list of all configured integrations for the hub page.
GET /api/integrations

// To trigger a new connection test for an existing integration.
POST /api/integrations/:id/test

// To update settings (e.g., enable/disable).
PUT /api/integrations/:id

// To securely delete an integration and its credentials.
DELETE /api/integrations/:id`
                        }</code></pre>

                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-4">Modular Service Layer</h4>
                        <p>To ensure scalability, the backend code should be organized into a modular service layer. Each integration should have its own dedicated service file (e.g., <code>stripe.service.ts</code>, <code>quickbooks.service.ts</code>) that contains all the specific logic for communicating with that third-party API.</p>
                        <p>This architecture makes it simple to add new integrations in the future without modifying existing code, leading to a more maintainable and robust system.</p>
                    </Step>
                </div>
            </div>
        </div>
    );
};

export default BackendArchitecturePage;
