import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StockAdjustmentType } from '../types';
import { useNavigate, Link } from 'react-router-dom';

const AddStockAdjustmentPage: React.FC = () => {
    const { products, addStockAdjustment, hasPermission } = useAuth();
    const navigate = useNavigate();

    const [productId, setProductId] = useState<string>(products[0]?.id || '');
    const [type, setType] = useState<StockAdjustmentType>('addition');
    const [quantity, setQuantity] = useState<number>(1);
    const [reason, setReason] = useState<string>('');
    const [errors, setErrors] = useState({ quantity: '', reason: '' });

    const selectedProduct = useMemo(() => products.find(p => p.id === productId), [productId, products]);

    if (!hasPermission('stock_adjustment:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to add stock adjustments.
                </p>
                 <Link to="/stock-adjustments" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Stock Adjustments
                </Link>
            </div>
        );
    }

    const validate = () => {
        const newErrors = { quantity: '', reason: '' };
        let isValid = true;
        if (quantity <= 0) {
            newErrors.quantity = 'Quantity must be a positive number.';
            isValid = false;
        } else if (type === 'subtraction' && selectedProduct && quantity > selectedProduct.stock) {
            newErrors.quantity = `Quantity cannot exceed current stock of ${selectedProduct.stock}.`;
            isValid = false;
        }

        if (!reason.trim()) {
            newErrors.reason = 'Reason is required.';
            isValid = false;
        } else if (reason.trim().length < 5) {
            newErrors.reason = 'Reason must be at least 5 characters long.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            addStockAdjustment({ productId, type, quantity, reason });
            navigate('/stock-adjustments');
        }
    };

    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
    const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 border-b dark:border-slate-700">
                    <h1 className="text-2xl font-bold">Add Stock Adjustment</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Record a change in your inventory.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="productId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product</label>
                        <select id="productId" value={productId} onChange={e => setProductId(e.target.value)} className={baseInputClasses}>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Adjustment Type</label>
                        <select id="type" value={type} onChange={e => setType(e.target.value as StockAdjustmentType)} className={baseInputClasses}>
                            <option value="addition">Addition</option>
                            <option value="subtraction">Subtraction</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity*</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value, 10) || 0)}
                            min="1"
                            className={`${baseInputClasses} ${errors.quantity ? errorInputClasses : ''}`}
                            aria-invalid={!!errors.quantity}
                            aria-describedby="quantity-error"
                        />
                        {selectedProduct && type === 'subtraction' && 
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Current stock: {selectedProduct.stock}</p>
                        }
                        {errors.quantity && <p id="quantity-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>}
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reason*</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            rows={3}
                            className={`${baseInputClasses} ${errors.reason ? errorInputClasses : ''}`}
                            aria-invalid={!!errors.reason}
                            aria-describedby="reason-error"
                        />
                        {errors.reason && <p id="reason-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/stock-adjustments')} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save Adjustment</button>
                </div>
            </form>
        </div>
    );
};

export default AddStockAdjustmentPage;
