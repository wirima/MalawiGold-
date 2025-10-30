import React, { useState, useEffect } from 'react';

interface NfcPaymentModalProps {
    isOpen: boolean;
    amount: number;
    onClose: () => void;
    onSuccess: () => void;
}

type PaymentStatus = 'waiting' | 'processing' | 'success' | 'failed';

const NfcPaymentModal: React.FC<NfcPaymentModalProps> = ({ isOpen, amount, onClose, onSuccess }) => {
    const [status, setStatus] = useState<PaymentStatus>('waiting');

    useEffect(() => {
        if (isOpen) {
            setStatus('waiting');
            const processingTimer = setTimeout(() => {
                setStatus('processing');
                const successTimer = setTimeout(() => {
                    setStatus('success');
                    onSuccess();
                    const closeTimer = setTimeout(() => {
                        onClose();
                    }, 1500); // Auto-close after success message
                    return () => clearTimeout(closeTimer);
                }, 2500); // Simulate processing time
                return () => clearTimeout(successTimer);
            }, 1000); // Initial delay before "processing"
            return () => clearTimeout(processingTimer);
        }
    }, [isOpen, onSuccess, onClose]);
    
    if (!isOpen) {
        return null;
    }

    const StatusContent: React.FC = () => {
        switch (status) {
            case 'processing':
                return (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                        <h3 className="mt-4 text-xl font-bold">Processing Payment...</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Please do not remove card.</p>
                    </>
                );
            case 'success':
                return (
                     <>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                             <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-green-600">Payment Successful</h3>
                    </>
                );
            case 'waiting':
            default:
                return (
                    <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0h6m-6 0a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75v2.25m0 0A3.75 3.75 0 006 14.25v.75a3.75 3.75 0 003.75 3.75h.75A3.75 3.75 0 0014.25 15v-.75a3.75 3.75 0 00-3.75-3.75H9.75Z" />
                        </svg>
                        <h3 className="mt-4 text-xl font-bold">Waiting for Tap</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ask customer to tap their card or device on the terminal.</p>
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
                            {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center rounded-b-lg">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                        Cancel Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NfcPaymentModal;