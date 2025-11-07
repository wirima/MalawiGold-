import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const IdeaCard: React.FC<{
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    concept: string;
    features: string[];
    icon: React.ReactNode;
}> = ({ title, priority, concept, features, icon }) => {
    const priorityClasses = {
        High: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Low: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            {icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    </div>
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[priority]}`}>
                        {priority} Priority
                    </span>
                </div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">{concept}</p>
                <div className="mt-4">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Key Features:</h4>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        {features.map((feature, index) => <li key={index}>{feature}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const GrowthSuggestionsPage: React.FC = () => {
    const { hasPermission } = useAuth();

    if (!hasPermission('growth:view')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to view this page.
                </p>
            </div>
        );
    }
    
    const Icon: React.FC<{ path: string }> = ({ path }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );

    const uaeIdeas = [
        {
            title: "B2B Logistics Optimizer for SMEs",
            priority: "High",
            concept: "A mobile-first SaaS platform for small retailers and F&B businesses to intelligently manage suppliers and inventory. This is a natural extension of your POS system's backend logic, solving a clear, monetizable problem in a major trade hub.",
            features: [
                "Simple purchase order creation and tracking.",
                "AI-powered forecasting to predict re-order points.",
                "Supplier management portal with communication tools.",
                "Direct integration with this POS for seamless data flow.",
            ],
            icon: <Icon path="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        },
        {
            title: "Smart Concierge & Lifestyle Platform",
            priority: "Medium",
            concept: "A premium, AI-powered platform for residents and high-end property managers to manage lifestyle services (e.g., laundry, cleaning, maintenance). Taps into the UAE's demand for convenience and luxury services.",
            features: [
                "Integration with local service vendors.",
                "AI-powered scheduling and request routing.",
                "Subscription billing for residents or SaaS model for building management.",
                "Manages 'services' with logic similar to your POS's 'products'.",
            ],
            icon: <Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        },
    ];

    const malawiIdeas = [
        {
            title: "Micro-SME Inventory & Mobile Money Ledger",
            priority: "High",
            concept: "A 'POS-lite' for small shop owners and market vendors on basic Android phones. This directly adapts your core POS concept to the local context by being simple, offline-first, and integrated with mobile money.",
            features: [
                "Works 100% offline, syncing when a connection is available.",
                "Simple inventory entry (can use phone camera for barcode scanning).",
                "Integration with mobile money APIs (Airtel Money, TNM Mpamba).",
                "Basic daily/weekly sales and stock reports.",
            ],
            icon: <Icon path="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        },
        {
            title: "Agri-Tech Platform for Smallholder Farmers",
            priority: "Medium",
            concept: "A simple, mobile-first tool to help small-scale farmers get fair market pricing and connect with buyers. This has immense social impact potential and solves a critical information gap in the agricultural sector.",
            features: [
                "SMS/USSD-based interface for accessibility without internet.",
                "Market price alerts for key local crops.",
                "Simple inventory tracking ('I have 50 bags of maize').",
                "Directory of buyers or connection to co-ops.",
            ],
            icon: <Icon path="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 003.86.517l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l2.387-.477a2 2 0 001.022-.547z" />
        },
    ];

    return (
        <div className="space-y-8">
             <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Growth Suggestions</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
                    A prioritized list of potential digital products tailored to your unique expertise across different markets.
                </p>
            </div>
            
            {/* UAE Market */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold">Target Market: UAE (High-Tech, Service-Oriented)</h2>
                    <p className="mt-1 text-slate-500">Ideas leveraging the region's focus on efficiency, luxury, and digital services.</p>
                </div>
                {uaeIdeas.map((idea, i) => <IdeaCard key={i} {...idea} />)}
            </div>
            
            {/* Malawi Market */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold">Target Market: Malawi (High-Impact, Mobile-First)</h2>
                    <p className="mt-1 text-slate-500">Ideas focused on solving fundamental problems, designed for accessibility on low-cost devices.</p>
                </div>
                {malawiIdeas.map((idea, i) => <IdeaCard key={i} {...idea} />)}
            </div>
        </div>
    );
};

export default GrowthSuggestionsPage;