import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProductSellReportPage: React.FC = () => {
    const { sales, products, customers, hasPermission } = useAuth();
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ start: '', end: today });
    const [customerFilter, setCustomerFilter] = useState('all');

    if (!hasPermission('reports:view')) {
        return <div className="text-center p-8">Access Denied.</div>;
    }

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const aggregatedData = useMemo(() => {
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);

        const filteredSales = sales.filter(s =>
            s.status === 'completed' &&
            (customerFilter === 'all' || s.customer.id === customerFilter) &&
            (!startDate || new Date(s.date) >= startDate) &&
            (!endDate || new Date(s.date) <= endDate)
        );

        // FIX: Explicitly typed the `reduce` accumulator to ensure correct type inference for `productSales`, which resolves the spread operator error.
        const productSales = filteredSales.reduce((acc: Record<string, { quantity: number; revenue: number; profit: number }>, sale) => {
            sale.items.forEach(item => {
                if (!acc[item.id]) {
                    acc[item.id] = { quantity: 0, revenue: 0, profit: 0 };
                }
                const productDetails = productsMap.get(item.id);
                if (productDetails) {
                    const itemRevenue = item.price * item.quantity;
                    const itemCost = productDetails.costPrice * item.quantity;
                    acc[item.id].quantity += item.quantity;
                    acc[item.id].revenue += itemRevenue;
                    acc[item.id].profit += itemRevenue - itemCost;
                }
            });
            return acc;
        }, {});
        
        return Object.entries(productSales).map(([productId, data]) => ({
            product: productsMap.get(productId),
            ...data
        })).filter(item => item.product).sort((a,b) => b.quantity - a.quantity);

    }, [sales, dateRange, customerFilter, productsMap]);

    const formatCurrency = (val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Product Sell Report</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Analyze sales performance for each product.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="date" name="start" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500" />
                    <input type="date" name="end" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500" />
                    <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500">
                        <option value="all">All Customers</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                                <th className="px-6 py-3 text-center">Quantity Sold</th>
                                <th className="px-6 py-3 text-right">Total Revenue</th>
                                <th className="px-6 py-3 text-right">Gross Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aggregatedData.map(({ product, quantity, revenue, profit }) => (
                                <tr key={product!.id} className="border-b dark:border-slate-700">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{product!.name}</td>
                                    <td className="px-6 py-4">{product!.sku}</td>
                                    <td className="px-6 py-4 text-center font-semibold">{quantity}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(revenue)}</td>
                                    <td className="px-6 py-4 text-right text-green-600">{formatCurrency(profit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductSellReportPage;