import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationTemplate } from '../types';

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-1 text-xs font-mono">
        {children}
    </span>
);

const TemplateCard: React.FC<{ template: NotificationTemplate }> = ({ template }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{template.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${template.type === 'email' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                                {template.type.toUpperCase()}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
                    </div>
                </div>
                
                <div className="mt-4 space-y-4">
                    {template.type === 'email' && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase">Subject</label>
                            <p className="mt-1 text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">{template.subject}</p>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase">Body</label>
                        <pre className="mt-1 text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md font-sans whitespace-pre-wrap">{template.body}</pre>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase">Available Tags</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {template.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                <button disabled className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 opacity-50 cursor-not-allowed">
                    Edit Template
                </button>
            </div>
        </div>
    );
};


const NotificationTemplatesPage: React.FC = () => {
    const { notificationTemplates, hasPermission } = useAuth();

    if (!hasPermission('notifications:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage notification templates.
                </p>
            </div>
        );
    }

    const customerTemplates = notificationTemplates.filter(t => t.group === 'customer');
    const supplierTemplates = notificationTemplates.filter(t => t.group === 'supplier');

    return (
        <div className="space-y-8">
             <div className="text-left">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Notification Templates</h1>
                <p className="mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
                    Customize the email and SMS notifications sent to your customers and suppliers.
                </p>
            </div>
            
            {/* Customer Notifications */}
            <div className="space-y-6">
                 <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold">Customer Notifications</h2>
                    <p className="mt-1 text-slate-500">Notifications related to sales, bookings, and customer interactions.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {customerTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            </div>

            {/* Supplier Notifications */}
            <div className="space-y-6">
                 <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold">Supplier Notifications</h2>
                    <p className="mt-1 text-slate-500">Notifications related to purchase orders and supplier payments.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {supplierTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationTemplatesPage;