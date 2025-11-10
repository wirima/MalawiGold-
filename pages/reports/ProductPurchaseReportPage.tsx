
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';

const ProductPurchaseReportPage: React.FC = () => {
    const { purchases, products, suppliers, hasPermission } = useAuth();
    const { formatCurrency } = useCurrency();
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ start: '', end: today });
    const [supplierFilter, setSupplierFilter] = useState('all');

    if (!hasPermission('reports:view')) {
        return <div className="text-center p-8">Access Denied.</div>;
    }

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const aggregatedData = useMemo(() => {
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        if(startDate) startDate.setHours(0,0,0,0);
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if(endDate) endDate.setHours(23,59,59,999);

        const filteredPurchases = purchases.filter(p =>
            (supplierFilter === 'all' || p.supplier.id === supplierFilter) &&
            (!startDate || new Date(p.date) >= startDate) &&
            (!endDate || new Date(p.date) <= endDate)
        );

        // FIX: Explicitly type the initial value of the `reduce` method to ensure the accumulator and its properties are correctly typed, resolving downstream spread operator errors.
        const productPurchases = filteredPurchases.reduce((acc: Record<string, { quantity: number; total: number }>, purchase) => {
            purchase.items.forEach(item => {
                if (!acc[item.id]) {
                    acc[item.id] = { quantity: 0, total: 0 };
                }
                acc[item.id].quantity += item.quantity;
                acc[item.id].total += item.price * item.quantity;
            });
            return acc;
        }, {} as Record<string, { quantity: number; total: number }>);
        
        return Object.entries(productPurchases).map(([productId, data]) => ({
            product: productsMap.get(productId),
            ...data
        })).filter(item => item.product).sort((a,b) => b.quantity - a.quantity);

    }, [purchases, dateRange, supplierFilter, productsMap]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Product Purchase Report</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Analyze purchase history for each product.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="date" name="start" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500" />
                    <input type="date" name="end" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500" />
                    <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500">
                        <option value="all">All Suppliers</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">SKU</th>
                                <th className="px-6 py-3 text-center">Quantity Purchased</th>
                                <th className="px-6 py-3 text-right">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aggregatedData.map(({ product, quantity, total }) => (
                                <tr key={product!.id} className="border-b dark:border-slate-700">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{product!.name}</td>
                                    <td className="px-6 py-4">{product!.sku}</td>
                                    <td className="px-6 py-4 text-center font-semibold">{quantity}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductPurchaseReportPage;