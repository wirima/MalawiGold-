import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

interface CustomerRequestModalProps {
    cashier: User;
    onClose: () => void;
}

const CustomerRequestModal: React.FC<CustomerRequestModalProps> = ({ cashier, onClose }) => {
    const { addCustomerRequests, signOut } = useAuth();
    const [requestsText, setRequestsText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignOutAndClose = async () => {
        await signOut();
        onClose();
        // The navigation will be handled by the effect in the main App component
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        if(requestsText.trim()){
            addCustomerRequests(requestsText, cashier);
        }
        // Simulate a small delay for feedback if needed, then sign out
        setTimeout(() => {
            setIsSubmitting(false);
            handleSignOutAndClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700">
                    <h3 className="text-xl font-bold">End of Shift: Customer Requests</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Before you close the terminal, please log any items customers asked for that were not available.</p>
                </div>
                <div className="p-6">
                    <label htmlFor="customer-requests" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Enter each request on a new line (e.g., "Gluten-free bread", "Oat milk option").
                    </label>
                    <textarea
                        id="customer-requests"
                        rows={6}
                        value={requestsText}
                        onChange={e => setRequestsText(e.target.value)}
                        className="mt-2 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Log customer requests here..."
                    />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-3 rounded-b-lg">
                    <button 
                        onClick={handleSignOutAndClose} 
                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                        Skip & Close Terminal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit & Close Terminal'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerRequestModal;