import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SplitPaymentModalProps {
    total: number;
    onClose: () => void;
    onConfirm: (payments: { methodId: string; amount: number }[]) => void;
}

const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({ total, onClose, onConfirm }) => {
    const { paymentMethods } = useAuth();
    const [payments, setPayments] = useState<{ methodId: string; amount: number; id: number }[]>([]);
    const [currentAmount, setCurrentAmount] = useState('');

    const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
    const remaining = total - totalPaid;
    
    // Auto-focus the amount input when the modal opens
    useEffect(() => {
        const amountInput = document.getElementById('payment-amount-input') as HTMLInputElement;
        if (amountInput) {
            amountInput.focus();
        }
    }, []);

    const addPayment = useCallback((methodId: string, amount: number) => {
        if (amount <= 0) return;
        setPayments(prev => [...prev, { methodId, amount, id: Date.now() }]);
        setCurrentAmount('');
    }, []);

    const handleAmountButtonClick = (amount: number | 'exact') => {
        const value = amount === 'exact' ? Math.max(0, remaining).toFixed(2) : amount.toString();
        setCurrentAmount(value);
    };

    const handlePaymentMethodClick = (methodId: string) => {
        const amount = parseFloat(currentAmount) || Math.max(0, remaining);
        if (amount > 0) {
            addPayment(methodId, amount);
        }
    };
    
    const removePayment = (paymentId: number) => {
        setPayments(prev => prev.filter(p => p.id !== paymentId));
    };

    const paymentMethodsMap = useMemo(() => new Map(paymentMethods.map(p => [p.id, p.name])), [paymentMethods]);
    const cashMethodId = paymentMethods.find(p => p.name.toLowerCase() === 'cash')?.id;
    const changeDue = cashMethodId && totalPaid > total ? totalPaid - total : 0;
    const isFullyPaid = remaining <= 0.005; // Use a small tolerance for floating point math
    
    // Keyboard shortcuts for payment modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && isFullyPaid) {
                e.preventDefault();
                onConfirm(payments);
                return;
            }

            if (e.altKey) {
                e.preventDefault();
                const amount = parseFloat(currentAmount) || Math.max(0, remaining);
                if (amount <= 0) return;
                
                const cashMethod = paymentMethods.find(p => p.id === 'pay_cash');
                const cardMethod = paymentMethods.find(p => p.id === 'pay_card');
                const qrMethod = paymentMethods.find(p => p.id === 'pay_qr');

                if (e.key.toLowerCase() === 'c' && cashMethod) addPayment(cashMethod.id, amount);
                if (e.key.toLowerCase() === 'r' && cardMethod) addPayment(cardMethod.id, amount);
                if (e.key.toLowerCase() === 'q' && qrMethod) addPayment(qrMethod.id, amount);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullyPaid, onConfirm, payments, currentAmount, remaining, paymentMethods, addPayment]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Finalize Payment</h3>
                </div>

                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    {/* Left: Totals & Payments */}
                    <div className="flex flex-col space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Due</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            </div>
                             <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Remaining</p>
                                <p className={`text-2xl font-bold ${isFullyPaid ? 'text-green-500' : 'text-red-500'}`}>{Math.max(0, remaining).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            </div>
                        </div>
                        <div className="flex-1 border-t dark:border-slate-700 pt-4">
                            <h4 className="font-semibold mb-2">Payments Added:</h4>
                             <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {payments.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">No payments added yet.</p>
                                ) : (
                                    payments.map(p => (
                                        <div key={p.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-sm">
                                            <span>{paymentMethodsMap.get(p.methodId)}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{p.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                                <button onClick={() => removePayment(p.id)} className="text-red-500 hover:text-red-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        {changeDue > 0 && (
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg text-center">
                                <p className="text-sm text-blue-800 dark:text-blue-300">Change Due</p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{changeDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            </div>
                        )}
                    </div>
                    {/* Right: Input */}
                    <div className="space-y-4">
                        <div className="relative">
                             <label htmlFor="payment-amount-input" className="sr-only">Payment Amount</label>
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-2xl font-mono">$</span>
                            <input
                                id="payment-amount-input"
                                data-testid="payment-amount-input"
                                type="number"
                                value={currentAmount}
                                onChange={e => setCurrentAmount(e.target.value)}
                                placeholder={Math.max(0, remaining).toFixed(2)}
                                className="w-full pl-8 pr-4 py-3 text-4xl font-mono text-right rounded-lg bg-slate-100 dark:bg-slate-900 border-transparent focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                         <div className="grid grid-cols-4 gap-2 text-sm">
                            <button onClick={() => handleAmountButtonClick(20)} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">$20</button>
                            <button onClick={() => handleAmountButtonClick(50)} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">$50</button>
                            <button onClick={() => handleAmountButtonClick(100)} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">$100</button>
                            <button onClick={() => handleAmountButtonClick('exact')} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Exact</button>
                        </div>
                        <div className="pt-4 border-t dark:border-slate-700 space-y-2">
                             {paymentMethods.filter(p => ['pay_cash', 'pay_card', 'pay_qr'].includes(p.id)).map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => handlePaymentMethodClick(method.id)}
                                    className="w-full p-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                                    data-testid={`payment-method-${method.id}`}
                                >
                                    Pay with {method.name} 
                                    {method.id === 'pay_cash' && <span className="ml-2 text-indigo-200 text-xs">(Alt+C)</span>}
                                    {method.id === 'pay_card' && <span className="ml-2 text-indigo-200 text-xs">(Alt+R)</span>}
                                    {method.id === 'pay_qr' && <span className="ml-2 text-indigo-200 text-xs">(Alt+Q)</span>}
                                </button>
                             ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(payments)}
                        disabled={!isFullyPaid}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                        data-testid="confirm-payment-button"
                    >
                        Confirm Payment (Enter)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitPaymentModal;