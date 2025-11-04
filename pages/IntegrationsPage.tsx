import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IntegrationConnection } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const IntegrationsPage: React.FC = () => {
    const { integrations, hasPermission, deleteIntegration } = useAuth();
    const navigate = useNavigate();
    const [confirmDelete, setConfirmDelete] = useState<IntegrationConnection | null>(null);

    if (!hasPermission('settings:integrations')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    You do not have permission to manage integrations.
                </p>
            </div>
        );
    }

    const integrationCategories = [
        {
            title: 'Supplier & Procurement',
            description: 'Connect to vendor APIs to sync products and automate purchase orders.',
            integrations: [
                {
                    name: 'Vendor API Connector',
                    description: 'A generic connector for any vendor with a REST API.',
                    logo: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
                    addPath: '/settings/integrations/vendor-api',
                    provider: 'vendor-api'
                }
            ]
        },
        {
            title: 'Payment Gateways',
            description: 'Connect to payment processors for credit card and other digital payments.',
            integrations: [
                {
                    name: 'Stripe Terminal',
                    description: 'Process in-person payments with Stripe card readers.',
                    logo: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
                    addPath: '/settings/integrations/payment-gateway',
                    provider: 'payment-gateway'
                },
                {
                    name: 'Square POS',
                    description: 'Integrate with Square hardware for seamless payments.',
                    logo: 'M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5v2.25m0-2.25l2.25 1.313M9 12l2.25-1.313M15 12l-2.25-1.313M12 10.5V12m0 0v2.25m0-2.25l-2.25 1.313M12 12l2.25 1.313M3.75 14.25l2.25-1.313M20.25 14.25l-2.25-1.313M12 16.5V18m0-1.5l-2.25 1.313M12 16.5l2.25 1.313',
                    addPath: '/settings/integrations/payment-gateway',
                    provider: 'payment-gateway'
                }
            ]
        }
    ];

    const handleDelete = (connection: IntegrationConnection) => {
        setConfirmDelete(connection);
    };

    const confirmDeletion = () => {
        if (confirmDelete) {
            deleteIntegration(confirmDelete.id);
            setConfirmDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Integrations</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Connect your POS to external services to extend its functionality.</p>
                </div>

                {integrationCategories.map(category => (
                    <div key={category.title} className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                        <div className="p-6 border-b dark:border-slate-700">
                            <h2 className="text-xl font-semibold">{category.title}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{category.description}</p>
                        </div>
                        <div className="p-6 divide-y dark:divide-slate-700">
                            {category.integrations.map((integration, index) => {
                                const activeConnections = integrations.filter(i => i.name.toLowerCase().includes(integration.name.split(' ')[0].toLowerCase()));
                                
                                return (
                                <div key={integration.name} className={`py-4 ${index === 0 ? 'pt-0' : ''} ${index === category.integrations.length - 1 ? 'pb-0' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d={integration.logo} />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{integration.name}</h3>
                                                <p className="text-sm text-slate-500">{integration.description}</p>
                                            </div>
                                        </div>
                                        <Link to={integration.addPath} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap">Add Connection</Link>
                                    </div>
                                    
                                    {activeConnections.length > 0 && (
                                        <div className="mt-4 pl-16 space-y-2">
                                            {activeConnections.map(conn => (
                                                <div key={conn.id} className="flex justify-between items-center p-2 rounded-md bg-slate-50 dark:bg-slate-700/50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        <span className="font-medium text-sm">{conn.name}</span>
                                                    </div>
                                                    <div className="space-x-2">
                                                        <button onClick={() => navigate(`${integration.addPath}/${conn.id}`)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline text-sm">Edit</button>
                                                        <button onClick={() => handleDelete(conn)} className="font-medium text-red-600 dark:text-red-500 hover:underline text-sm">Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )})}
                             {category.integrations.length === 0 && <p className="text-center py-6 text-slate-500 text-sm">Integrations for this category are coming soon.</p>}
                        </div>
                    </div>
                ))}
            </div>
            {confirmDelete && (
                <ConfirmationModal 
                    isOpen={!!confirmDelete}
                    title="Delete Connection"
                    message={`Are you sure you want to delete the connection "${confirmDelete.name}"? This action cannot be undone.`}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={confirmDeletion}
                    confirmButtonText="Confirm Disconnect"
                />
            )}
        </>
    );
};

export default IntegrationsPage;