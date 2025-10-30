import React from 'react';
import { CartItem } from '../types';

interface HeldOrder {
    id: number;
    cart: CartItem[];
    customerId: string;
    customerName: string;
}

interface ResumeOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    heldOrders: HeldOrder[];
    onResume: (orderId: number) => void;
}

const ResumeOrderModal: React.FC<ResumeOrderModalProps> = ({ isOpen, onClose, heldOrders, onResume }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Resume Held Order</h3>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                    {heldOrders.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No orders are currently on hold.</p>
                    ) : (
                        <ul className="space-y-3">
                            {heldOrders.map(order => (
                                <li key={order.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{order.customerName}</p>
                                        <p className="text-sm text-slate-500">{order.cart.length} items - Total: {(order.cart.reduce((acc, item) => acc + item.price * item.quantity, 0) * 1.08).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    </div>
                                    <button
                                        onClick={() => onResume(order.id)}
                                        className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                                        data-testid={`resume-order-${order.id}`}
                                    >
                                        Resume
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeOrderModal;