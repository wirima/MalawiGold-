import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PaymentMethod, BankAccount } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

// Modal for adding/editing payment methods
const PaymentMethodFormModal: React.FC<{
    method: PaymentMethod | null;
    onClose: () => void;
    onSave: (data: PaymentMethod | Omit<PaymentMethod, 'id'>) => void;
    bankAccounts: BankAccount[];
}> = ({ method, onClose, onSave, bankAccounts }) => {
    const { integrations } = useAuth();
    const paymentGateways = integrations.filter(i => i.provider === 'payment-gateway');
    const isEditing = !!method;

    const [name, setName] = useState(method?.name || '');
    const [type, setType] = useState<PaymentMethod['type']>(method?.type || 'cash');
    const [accountId, setAccountId] = useState(method?.accountId || '');
    const [integrationId, setIntegrationId] = useState(method?.integrationId || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (method) {
            setName(method.name);
            setType(method.type);
            setAccountId(method.accountId || '');
            setIntegrationId(method.integrationId || '');
        }
    }, [method]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Method name is required.');
            return;
        }
        if (type === 'integrated' && !integrationId) {
            setError('An integration must be selected for this payment type.');
            return;
        }
        setError('');
        const saveData: PaymentMethod | Omit<PaymentMethod, 'id'> = {
            ...(isEditing && { id: method.id }),
            name,
            type,
            ...(accountId && { accountId }),
            ...(integrationId && type === 'integrated' && { integrationId }),
        };
        onSave(saveData);
    };
    
    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">{isEditing ? 'Edit Payment Method' : 'Add Payment Method'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Method Name*</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={`${baseInputClasses} ${error && !name.trim() ? 'border-red-500' : ''}`} />
                            {error && !name.trim() && <p className="text-sm text-red-500 mt-1">{error}</p>}
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium">Type*</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value as PaymentMethod['type'])} className={baseInputClasses}>
                                <option value="cash">Cash</option>
                                <option value="manual">Manual (Bank Transfer, Check, etc.)</option>
                                <option value="integrated">Integrated Terminal</option>
                            </select>
                        </div>
                         {type === 'integrated' && (
                             <div>
                                <label htmlFor="integrationId" className="block text-sm font-medium">Payment Gateway*</label>
                                <select id="integrationId" value={integrationId} onChange={e => setIntegrationId(e.target.value)} className={`${baseInputClasses} ${error && type==='integrated' && !integrationId ? 'border-red-500' : ''}`}>
                                    <option value="" disabled>-- Select a Gateway --</option>
                                    {paymentGateways.map(gw => <option key={gw.id} value={gw.id}>{gw.name}</option>)}
                                </select>
                                {error && type==='integrated' && !integrationId && <p className="text-sm text-red-500 mt-1">{error}</p>}
                            </div>
                        )}
                        {type !== 'integrated' && (
                             <div>
                                <label htmlFor="accountId" className="block text-sm font-medium">Deposit To (Optional)</label>
                                <select id="accountId" value={accountId} onChange={e => setAccountId(e.target.value)} className={baseInputClasses}>
                                    <option value="">None (e.g., Cash)</option>
                                    {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName} ({acc.bankName})</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Method'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PaymentMethodsPage: React.FC = () => {
    const { paymentMethods, bankAccounts, integrations, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, hasPermission } = useAuth();
    const canManage = hasPermission('settings:payment');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<PaymentMethod | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const bankAccountsMap = new Map(bankAccounts.map(acc => [acc.id, acc.accountName]));
    const integrationsMap = new Map(integrations.map(i => [i.id, i.name]));

    if (!canManage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage payment methods.
                </p>
            </div>
        );
    }
    
    const handleSave = (data: PaymentMethod | Omit<PaymentMethod, 'id'>) => {
        if ('id' in data) {
            updatePaymentMethod(data);
        } else {
            addPaymentMethod(data);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (method: PaymentMethod) => {
        setApiError(null);
        setConfirmDelete(method);
    };

    const confirmDeletion = () => {
        if (confirmDelete) {
            try {
                deletePaymentMethod(confirmDelete.id);
            } catch (error: any) {
                setApiError(error.message);
            }
            setConfirmDelete(null);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Payment Methods</h1>
                        <p className="text-slate-500 mt-1">Manage payment options available at POS.</p>
                    </div>
                    <button onClick={() => { setEditingMethod(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold">
                        Add Method
                    </button>
                </div>
                 {apiError && <div className="p-4 m-6 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">{apiError} <button onClick={() => setApiError(null)} className="font-bold ml-4">X</button></div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th className="px-6 py-3">Method Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Linked To</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentMethods.map(method => (
                                <tr key={method.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{method.name}</td>
                                    <td className="px-6 py-4 capitalize">{method.type}</td>
                                    <td className="px-6 py-4">
                                        {method.type === 'integrated' 
                                            ? (integrationsMap.get(method.integrationId || '') || 'N/A')
                                            : (bankAccountsMap.get(method.accountId || '') || 'N/A')
                                        }
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => { setEditingMethod(method); setIsModalOpen(true); }} className="font-medium text-indigo-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(method)} className="font-medium text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <PaymentMethodFormModal 
                    method={editingMethod}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    bankAccounts={bankAccounts}
                />
            )}
            {confirmDelete && (
                <ConfirmationModal 
                    isOpen={!!confirmDelete}
                    title="Delete Payment Method"
                    message={`Are you sure you want to delete "${confirmDelete.name}"? This may affect historical sales data.`}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={confirmDeletion}
                />
            )}
        </>
    );
};

export default PaymentMethodsPage;