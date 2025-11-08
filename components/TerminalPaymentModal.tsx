import React, { useState, useEffect } from 'react';
import { processTerminalPayment, TerminalStatus, TerminalPaymentResult } from '../services/paymentService';
import { useCurrency } from '../contexts/CurrencyContext';

interface TerminalPaymentModalProps {
    isOpen: boolean;
    amount: number;
    onClose: () => void;
    onSuccess: (result: TerminalPaymentResult) => void;
}

const TerminalPaymentModal: React.FC<TerminalPaymentModalProps> = ({ isOpen, amount, onClose, onSuccess }) => {
    const [status, setStatus] = useState<TerminalStatus>('processing');
    const [message, setMessage] = useState('Initializing terminal...');
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (isOpen) {
            const processPayment = async () => {
                try {
                    const result = await processTerminalPayment(amount, (newStatus, newMessage) => {
                        setStatus(newStatus);
                        setMessage(newMessage);
                    });
                    
                    setTimeout(() => {
                        onSuccess(result);
                    }, 1500); // Show success message for a moment before closing

                } catch (error: any) {
                    // Failures are handled by the status change callback
                    console.error("Terminal payment failed:", error.message);
                }
            };
            processPayment();
        }
    }, [isOpen, amount, onSuccess, onClose]);
    
    if (!isOpen) {
        return null;
    }

    const StatusContent: React.FC = () => {
        switch (status) {
            case 'processing':
                return (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                        <h3 className="mt-4 text-xl font-bold">{message}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Please do not remove card.</p>
                    </>
                );
            case 'success':
                return (
                     <>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                             <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-green-600">{message}</h3>
                    </>
                );
             case 'failed':
             case 'cancelled':
                return (
                     <>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                             <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-red-600">{message}</h3>
                    </>
                );
            case 'waiting':
            default:
                return (
                    <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0h6m-6 0a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75v2.25m0 0A3.75 3.75 0 006 14.25v.75a3.75 3.75 0 003.75 3.75h.75A3.75 3.75 0 0014.25 15v-.75a3.75 3.75 0 00-3.75-3.75H9.75Z" />
                        </svg>
                        <h3 className="mt-4 text-xl font-bold">{message}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ask customer to complete payment on the terminal.</p>
                    </>
                );
        }
    };


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <StatusContent />
                    <div className="mt-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Amount to Charge</p>
                        <p className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                            {formatCurrency(amount)}
                        </p>
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center rounded-b-lg">
                    <button onClick={onClose} disabled={status === 'success' || status === 'processing'} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50">
                        Cancel Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TerminalPaymentModal;
