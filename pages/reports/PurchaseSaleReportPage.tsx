
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardCard from '../../components/DashboardCard';

const PurchaseSaleReportPage: React.FC = () => {
    const { sales, purchases, purchaseReturns, customerReturns, hasPermission } = useAuth();
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ start: '', end: today });

    if (!hasPermission('reports:view')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">You do not have permission to view reports.</p>
            </div>
        );
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const reportData = useMemo(() => {
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);

        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);

        const filterByDate = (item: { date: string }) => {
            const itemDate = new Date(item.date);
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            return true;
        };

        const filteredSales = sales.filter(s => s.status === 'completed').filter(filterByDate);
        const filteredPurchases = purchases.filter(filterByDate);
        const filteredSalesReturns = customerReturns.filter(filterByDate);
        const filteredPurchaseReturns = purchaseReturns.filter(filterByDate);

        const totalSales = filteredSales.reduce((sum, sale) => {
            const subtotal = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            let discountAmount = 0;
            if (sale.discount) {
                discountAmount = sale.discount.type === 'percentage' ? (subtotal * sale.discount.value) / 100 : sale.discount.value;
            }
            return sum + (subtotal - discountAmount);
        }, 0);

        const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.total, 0);
        
        const totalSalesReturns = filteredSalesReturns.reduce((sum, ret) => {
            const returnValue = ret.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            return sum + returnValue;
        }, 0);
        
        const totalPurchaseReturns = filteredPurchaseReturns.reduce((sum, r) => sum + r.total, 0);

        return {
            totalSales,
            totalPurchases,
            totalSalesReturns,
            totalPurchaseReturns,
            netSales: totalSales - totalSalesReturns,
            netPurchases: totalPurchases - totalPurchaseReturns,
        };
    }, [sales, purchases, customerReturns, purchaseReturns, dateRange]);

    const Icon: React.FC<{ path: string }> = ({ path }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
    );
    
    const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Purchase & Sale Report</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Summary of your purchases and sales.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="start" className="text-sm font-medium">Start Date</label>
                        <input type="date" name="start" id="start" value={dateRange.start} onChange={handleDateChange} className="mt-1 w-full pl-3 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="end" className="text-sm font-medium">End Date</label>
                        <input type="date" name="end" id="end" value={dateRange.end} onChange={handleDateChange} className="mt-1 w-full pl-3 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <DashboardCard title="Total Sales" value={formatCurrency(reportData.totalSales)} icon={<Icon path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 014.5 4.5h-.75m16.5 0h.75a.75.75 0 01.75.75v.75h-.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0h-.75a.75.75 0 01-.75-.75V6h.75m0 0v-.75a.75.75 0 01.75-.75h.75M9 7.5h6m-6 3h6m-6 3h6m-6 3h6m-6 3h6" />} />
                 <DashboardCard title="Total Purchases" value={formatCurrency(reportData.totalPurchases)} icon={<Icon path="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />} />
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Sales vs Purchases</p>
                        <p className="text-2xl font-bold text-green-500 mt-1">{formatCurrency(reportData.netSales)}</p>
                        <p className="text-sm text-slate-500">vs</p>
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(reportData.netPurchases)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                 <h3 className="text-xl font-semibold mb-2">Detailed Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div>
                        <h4 className="font-bold mb-2">Sales</h4>
                        <div className="flex justify-between py-2 border-b dark:border-slate-700"><span className="text-slate-500">Gross Sales</span><span>{formatCurrency(reportData.totalSales)}</span></div>
                        <div className="flex justify-between py-2 border-b dark:border-slate-700"><span className="text-slate-500">Sales Returns</span><span className="text-red-500">- {formatCurrency(reportData.totalSalesReturns)}</span></div>
                        <div className="flex justify-between py-2 font-bold"><span >Net Sales</span><span>{formatCurrency(reportData.netSales)}</span></div>
                    </div>
                     <div>
                        <h4 className="font-bold mb-2">Purchases</h4>
                        <div className="flex justify-between py-2 border-b dark:border-slate-700"><span className="text-slate-500">Gross Purchases</span><span>{formatCurrency(reportData.totalPurchases)}</span></div>
                        <div className="flex justify-between py-2 border-b dark:border-slate-700"><span className="text-slate-500">Purchase Returns</span><span className="text-red-500">- {formatCurrency(reportData.totalPurchaseReturns)}</span></div>
                        <div className="flex justify-between py-2 font-bold"><span >Net Purchases</span><span>{formatCurrency(reportData.netPurchases)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseSaleReportPage;
