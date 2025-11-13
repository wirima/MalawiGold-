import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PricingTier from '../components/PricingTier';
import { useNavigate } from 'react-router-dom';

const MarketingStrategyCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {icon}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{children}</p>
    </div>
);

const SubscriptionPage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<{ plan: string, status: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (currentUser) {
            setTimeout(() => {
                if (currentUser.account_status === 'active' || currentUser.account_status === 'onboarding_pending') {
                     setSubscription({ plan: 'Professional', status: 'active' }); // Assume pro plan for now
                } else {
                    setSubscription(null);
                }
                setLoading(false);
            }, 500);
        } else {
            setSubscription(null);
            setLoading(false);
        }
    }, [currentUser]);

    const handleManageSubscription = () => {
        alert('Redirecting to Stripe Billing Portal... (Simulation)');
    };
    
    const handleSelectPlan = (plan: 'pos' | 'inventory' | 'bundle' | 'professional') => {
        navigate(`/checkout?plan=${plan}`);
    };
    
    const Icon: React.FC<{ path: string }> = ({ path }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );

    return (
        <div className="space-y-16 py-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Flexible Plans for Every Business</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
                    Choose the plan that's right for you. All plans come with our commitment to quality and support.
                </p>
            </div>

            {/* Pricing Tiers */}
            <div>
                 <div className="text-center mb-8">
                     {loading ? (
                        <div className="p-8">Loading subscription status...</div>
                     ) : subscription ? (
                        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 max-w-md mx-auto">
                            <p className="text-slate-600 dark:text-slate-300">You are currently on the <span className="font-bold text-indigo-600 dark:text-indigo-400">{subscription.plan}</span> plan.</p>
                            <button onClick={handleManageSubscription} className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Manage Billing & Invoices</button>
                        </div>
                     ) : (
                         <p className="text-slate-500 dark:text-slate-400">Select a plan to get started.</p>
                     )}
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
                    <PricingTier
                        name="POS Plan"
                        price={15}
                        features={[
                            'Core POS Functionality', 'Customer Management', 'Sales, Drafts & Quotations', 'Shipment Tracking', 'Basic Sales Reports', '1 Business Location', 'Up to 2 User Accounts', 'Standard Email Support',
                        ]}
                        isCurrentPlan={subscription?.plan === 'POS Plan'}
                        onSelect={() => handleSelectPlan('pos')}
                    />
                    <PricingTier
                        name="Inventory Plan"
                        price={15}
                        features={[
                            'Product Management', 'Purchase Orders', 'Stock Transfers & Adjustments', 'Supplier Management', 'Basic Inventory Reports', '1 Business Location', 'Up to 2 User Accounts', 'Standard Email Support',
                        ]}
                        isCurrentPlan={subscription?.plan === 'Inventory Plan'}
                        onSelect={() => handleSelectPlan('inventory')}
                    />
                    <PricingTier
                        name="Business Bundle"
                        price={25}
                        isFeatured
                        features={[
                            'All features in POS Plan',
                            'All features in Inventory Plan',
                            'Combined Reporting',
                            'Up to 5 User Accounts',
                            'Multi-Location Support (2)',
                            'Priority Email Support',
                        ]}
                        isCurrentPlan={subscription?.plan === 'Business Bundle'}
                        onSelect={() => handleSelectPlan('bundle')}
                    />
                    <PricingTier
                        name="Professional"
                        price={35}
                        features={[
                            'All features in Business Bundle', 'AI-Powered Business Insights & Reports', 'Advanced Reporting Suite', 'Unlimited User Accounts', 'Unlimited Locations', 'Third-Party Integrations', 'Dedicated Support',
                        ]}
                        isCurrentPlan={subscription?.plan === 'Professional'}
                        onSelect={() => handleSelectPlan('professional')}
                    />
                </div>
            </div>
            
            {/* Marketing Plan */}
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Marketing & Growth Strategy</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <MarketingStrategyCard title="Target Audience" icon={<Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}>
                        Focus on small to medium-sized businesses (SMBs) like cafes, boutiques, small retail stores, and service-based businesses needing simple inventory tracking.
                    </MarketingStrategyCard>
                     <MarketingStrategyCard title="Online Presence" icon={<Icon path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />}>
                        Create a modern landing page highlighting the AI features. Use social media (LinkedIn, Instagram) for visual demos. Start a blog with content on "how to improve retail efficiency".
                    </MarketingStrategyCard>
                    <MarketingStrategyCard title="User Acquisition" icon={<Icon path="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />}>
                        Offer a fully-featured, 14-day free trial for the Professional plan. This lets users experience the value of the AI insights firsthand, increasing conversion rates.
                    </MarketingStrategyCard>
                     <MarketingStrategyCard title="Partnerships" icon={<Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}>
                        Collaborate with POS hardware vendors to bundle the software. Partner with business consultants and accountants who can recommend the software to their clients.
                    </MarketingStrategyCard>
                 </div>
            </div>

            {/* Architectural Vision */}
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Multi-Tenant Architecture Vision</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-3xl mx-auto text-center">
                    To support multiple subscribed businesses with complete data isolation, a "database per tenant" model is recommended. This provides the highest level of security and simplifies data backups for individual customers.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="text-center">
                         <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg inline-block">
                            <Icon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </div>
                        <h3 className="font-semibold mt-2">1. User Signup</h3>
                        <p className="text-xs text-slate-500">A new business signs up.</p>
                    </div>
                     <div className="text-3xl text-slate-300 dark:text-slate-600 hidden md:block">&rarr;</div>
                    <div className="text-center">
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg inline-block">
                            <Icon path="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                         </div>
                        <h3 className="font-semibold mt-2">2. DB Provisioning</h3>
                        <p className="text-xs text-slate-500">An isolated database is created.</p>
                    </div>
                    <div className="text-3xl text-slate-300 dark:text-slate-600 hidden md:block">&rarr;</div>
                    <div className="text-center">
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg inline-block">
                            <Icon path="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1.75a1.75 1.75 0 01-1.75-1.75V11a1.75 1.75 0 011.75-1.75H3V7a2 2 0 012-2h2v2H5v2h2v-2h2v2h2V7a2 2 0 012-2h2a2 2 0 012 2v2h-2v-2h-2v2h2zm-7 2a4 4 0 11-8 0 4 4 0 018 0z" />
                         </div>
                        <h3 className="font-semibold mt-2">3. Tenant ID</h3>
                        <p className="text-xs text-slate-500">API requests are tagged with a unique ID.</p>
                    </div>
                     <div className="text-3xl text-slate-300 dark:text-slate-600 hidden md:block">&rarr;</div>
                    <div className="text-center">
                         <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg inline-block">
                            <Icon path="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                         </div>
                        <h3 className="font-semibold mt-2">4. Data Isolation</h3>
                        <p className="text-xs text-slate-500">Backend connects to the correct database.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;