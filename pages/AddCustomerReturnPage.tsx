import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sale, CartItem } from '../types';
import { useNavigate, Link } from 'react-router-dom';

const AddCustomerReturnPage: React.FC = () => {
    const { sales, addCustomerReturn, hasPermission } = useAuth();
    const navigate = useNavigate();

    const [selectedSaleId, setSelectedSaleId] = useState<string>('');
    const [reason, setReason] = useState('');
    const [itemsToReturn, setItemsToReturn] = useState<Record<string, { product: CartItem, quantity: number }>>({});
    const [error, setError] = useState<string>('');

    if (!hasPermission('returns:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to add customer returns.
                </p>
                <Link to="/sell/returns" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Returns
                </Link>
            </div>
        );
    }

    const selectedSale = useMemo(() => sales.find(s => s.id === selectedSaleId), [selectedSaleId, sales]);
    const totalRefund = useMemo(() => {
        // FIX: Explicitly type the accumulator `acc` and `item` in the `reduce` function to ensure correct type inference for arithmetic operations.
        return Object.values(itemsToReturn).reduce((acc: number, item: { product: CartItem; quantity: number; }) => {
            return acc + item.product.price * item.quantity;
        }, 0);
    }, [itemsToReturn]);

    const handleSaleSelect = (saleId: string) => {
        setSelectedSaleId(saleId);
        setItemsToReturn({}); // Reset items when sale changes
    };
    
    const handleQuantityChange = (product: CartItem, quantityStr: string) => {
        const quantity = parseInt(quantityStr, 10);
        if (isNaN(quantity) || quantity <= 0) {
            setItemsToReturn(prev => {
                const newItems = { ...prev };
                delete newItems[product.id];
                return newItems;
            });
        } else if (quantity > product.quantity) {
            // Do not allow more than purchased
        } else {
            setItemsToReturn(prev => ({
                ...prev,
                [product.id]: { product, quantity }
            }));
        }
    };

    const handleSaveReturn = () => {
        if (!selectedSale) {
            setError('You must select a sale.');
            return;
        }
        if (Object.keys(itemsToReturn).length === 0) {
            setError('You must select at least one item to return.');
            return;
        }
        if (!reason.trim()) {
            setError('A reason for the return is required.');
            return;
        }

        const returnData = {
            originalSaleId: selectedSale.id,
            customer: selectedSale.customer,
            items: Object.values(itemsToReturn).map(({ product, quantity }) => ({ ...product, quantity })),
            reason,
            total: totalRefund,
        };

        addCustomerReturn(returnData);
        navigate('/sell/returns');
    };

    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md max-w-4xl mx-auto">
            <div className="p-6 border-b dark:border-slate-700">
                <h1 className="text-2xl font-bold">Add Customer Return</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Process a return against an original sale.</p>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="saleId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        1. Select the Original Sale
                    </label>
                    <select id="saleId" value={selectedSaleId} onChange={e => handleSaleSelect(e.target.value)} className={baseInputClasses}>
                        <option value="" disabled>-- Select a Sale ID --</option>
                        {sales.filter(s => s.status === 'completed').map(s => <option key={s.id} value={s.id}>{s.id} - {s.customer.name} ({new Date(s.date).toLocaleDateString()})</option>)}
                    </select>
                </div>

                {selectedSale && (
                    <>
                        <div>
                            <h3 className="text-lg font-semibold">2. Select Items to Return</h3>
                            <div className="mt-2 border rounded-lg dark:border-slate-700 max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-medium">Product</th>
                                            <th className="px-6 py-3 text-center font-medium">Quantity Purchased</th>
                                            <th className="px-6 py-3 text-center font-medium">Return Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedSale.items.map(item => (
                                            <tr key={item.id} className="border-t dark:border-slate-700">
                                                <td className="px-6 py-3">
                                                    <span className="font-semibold">{item.name}</span>
                                                    <span className="text-slate-500 ml-2">({item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">{item.quantity}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.quantity}
                                                        value={itemsToReturn[item.id]?.quantity || ''}
                                                        onChange={e => handleQuantityChange(item, e.target.value)}
                                                        className="w-20 text-center rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                3. Reason for Return*
                            </label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                rows={4}
                                className={baseInputClasses}
                                placeholder="e.g., 'Item was defective', 'Customer ordered wrong size', etc."
                            />
                        </div>
                        
                        <div className="text-right">
                             <p className="text-sm text-slate-500">Total Refund Amount</p>
                            <p className="text-2xl font-bold text-red-500">
                                -{totalRefund.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </p>
                        </div>
                    </>
                )}
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => navigate('/sell/returns')} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                    Cancel
                </button>
                <button type="button" onClick={handleSaveReturn} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                    Process Return
                </button>
            </div>
        </div>
    );
};

export default AddCustomerReturnPage;