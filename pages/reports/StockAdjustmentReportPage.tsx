
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StockAdjustmentType } from '../../types';
import DashboardCard from '../../components/DashboardCard';

const StockAdjustmentReportPage: React.FC = () => {
    const { stockAdjustments, products, hasPermission } = useAuth();
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ start: '', end: today });
    const [productFilter, setProductFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState<'all' | StockAdjustmentType>('all');

    if (!hasPermission('reports:view')) {
        return <div className="text-center p-8">Access Denied. You do not have permission to view reports.</div>;
    }

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p.name])), [products]);

    const filteredAdjustments = useMemo(() => {
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        if(startDate) startDate.setHours(0,0,0,0);
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if(endDate) endDate.setHours(23,59,59,999);

        return stockAdjustments.filter(adj => 
            (productFilter === 'all' || adj.productId === productFilter) &&
            (typeFilter === 'all' || adj.type === typeFilter) &&
            (!startDate || new Date(adj.date) >= startDate) &&
            (!endDate || new Date(adj.date) <= endDate)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [stockAdjustments, dateRange, productFilter, typeFilter]);

    const summaryData = useMemo(() => {
        return filteredAdjustments.reduce((acc, adj) => {
            if (adj.type === 'addition') acc.added += adj.quantity;
            else acc.subtracted += adj.quantity;
            return acc;
        }, { added: 0, subtracted: 0 });
    }, [filteredAdjustments]);

    const Icon: React.FC<{ path: string }> = ({ path }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Stock Adjustment Report</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Track inventory changes due to damage, corrections, or other reasons.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="date" name="start" value={dateRange.start} onChange={e => setDateRange(p=>({...p, start: e.target.value}))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"/>
                    <input type="date" name="end" value={dateRange.end} onChange={e => setDateRange(p=>({...p, end: e.target.value}))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"/>
                    <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"><option value="all">All Products</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"><option value="all">All Types</option><option value="addition">Addition</option><option value="subtraction">Subtraction</option></select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard title="Total Quantity Added" value={`+${summaryData.added}`} icon={<Icon path="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />} />
                <DashboardCard title="Total Quantity Subtracted" value={`-${summaryData.subtracted}`} icon={<Icon path="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Product</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Quantity</th><th className="px-6 py-3">Reason</th></tr>
                        </thead>
                        <tbody>
                            {filteredAdjustments.map(adj => <tr key={adj.id} className="border-b dark:border-slate-700">
                                <td className="px-6 py-4">{new Date(adj.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{productsMap.get(adj.productId) || 'Unknown'}</td>
                                <td className="px-6 py-4"><span className={`capitalize px-2 py-1 text-xs font-medium rounded-full ${adj.type === 'addition' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{adj.type}</span></td>
                                <td className={`px-6 py-4 font-semibold ${adj.type === 'addition' ? 'text-green-600' : 'text-red-600'}`}>{adj.type === 'addition' ? '+' : '-'}{adj.quantity}</td>
                                <td className="px-6 py-4">{adj.reason}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default StockAdjustmentReportPage;
