
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';

const Icon: React.FC<{ path: string }> = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const SETTINGS_TABS: { id: string; label: string; icon: React.ReactNode; permission: Permission; content: React.ReactNode }[] = [
    { id: 'tax', label: 'Tax Rates', icon: <Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />, permission: 'settings:tax', content: <div>Tax settings form...</div> },
    { id: 'product', label: 'Product', icon: <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />, permission: 'settings:product', content: <div>Product settings form...</div> },
    { id: 'contact', label: 'Contact', icon: <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />, permission: 'settings:contact', content: <div>Contact settings form...</div> },
    { id: 'sale', label: 'Sale', icon: <Icon path="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0 1.172 1.953 1.172 5.119 0 7.072z" />, permission: 'settings:sale', content: <div>Sale settings form...</div> },
    { id: 'pos', label: 'POS', icon: <Icon path="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />, permission: 'settings:pos', content: <div>POS settings form...</div> },
    { id: 'purchases', label: 'Purchases', icon: <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />, permission: 'settings:purchases', content: <div>Purchases settings form...</div> },
    { id: 'payment', label: 'Payment', icon: <Icon path="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />, permission: 'settings:payment', content: <div>Payment settings form...</div> },
    { id: 'dashboard', label: 'Dashboard', icon: <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />, permission: 'settings:dashboard', content: <div>Dashboard settings form...</div> },
    { id: 'system', label: 'System', icon: <Icon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />, permission: 'settings:system', content: <div>System settings form...</div> },
    { id: 'prefixes', label: 'Prefixes', icon: <Icon path="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />, permission: 'settings:prefixes', content: <div>Prefixes settings form...</div> },
    { id: 'email', label: 'Email', icon: <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, permission: 'settings:email', content: <div>Email settings form...</div> },
    { id: 'sms', label: 'SMS', icon: <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />, permission: 'settings:sms', content: <div>SMS settings form...</div> },
    { id: 'reward_points', label: 'Reward Points', icon: <Icon path="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />, permission: 'settings:reward_points', content: <div>Reward Points settings form...</div> },
    { id: 'modules', label: 'Modules', icon: <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />, permission: 'settings:modules', content: <div>Modules settings form...</div> },
    { id: 'custom_labels', label: 'Custom Labels', icon: <Icon path="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />, permission: 'settings:custom_labels', content: <div>Custom Labels settings form...</div> },
];

const SettingsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    const visibleTabs = useMemo(() => {
        return SETTINGS_TABS.filter(tab => hasPermission(tab.permission));
    }, [hasPermission]);
    
    useEffect(() => {
        if (!activeTabId && visibleTabs.length > 0) {
            setActiveTabId(visibleTabs[0].id);
        }
    }, [visibleTabs, activeTabId]);
    
    if (!hasPermission('settings:view')) {
        return <div className="text-center p-8">Access Denied. You do not have permission to view settings.</div>;
    }

    const activeTab = visibleTabs.find(tab => tab.id === activeTabId);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col md:flex-row min-h-[calc(100vh-8rem)]">
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <h2 className="text-lg font-bold mb-4">Settings</h2>
                <nav className="flex flex-row md:flex-col gap-1">
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTabId === tab.id
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {tab.icon}
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 p-6">
                {activeTab ? (
                     <div key={activeTab.id}>
                        <h1 className="text-2xl font-bold mb-1">{activeTab.label}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Manage {activeTab.label.toLowerCase()} for your application.</p>
                         <fieldset disabled className="space-y-6 opacity-60">
                            <div className="p-6 border dark:border-slate-700 rounded-lg">
                                 {/* This is just one example, you would build out a unique form for each tab */}
                                 {activeTab.id === 'pos' && (
                                     <>
                                        <h3 className="font-bold text-lg mb-4">Payment Methods</h3>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                            <label htmlFor="cash_enabled" className="font-medium">Cash</label>
                                            <input type="checkbox" id="cash_enabled" defaultChecked className="h-4 w-4 rounded" />
                                        </div>
                                         <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md mt-2">
                                            <label htmlFor="card_enabled" className="font-medium">Card</label>
                                            <input type="checkbox" id="card_enabled" defaultChecked className="h-4 w-4 rounded" />
                                        </div>
                                     </>
                                 )}
                                  {activeTab.id === 'prefixes' && (
                                     <>
                                        <h3 className="font-bold text-lg mb-4">Record Numbering</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="sale_prefix">Sale Prefix</label>
                                                <input type="text" id="sale_prefix" defaultValue="SALE-" className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent"/>
                                            </div>
                                             <div>
                                                <label htmlFor="purchase_prefix">Purchase Prefix</label>
                                                <input type="text" id="purchase_prefix" defaultValue="PO-" className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent"/>
                                            </div>
                                        </div>
                                     </>
                                 )}
                                 <p className="text-center text-sm text-slate-500 mt-8">These settings are disabled for this demo.</p>
                            </div>
                         </fieldset>
                     </div>
                ) : (
                    <div className="text-center py-20">
                        <p>Select a setting category to view.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SettingsPage;