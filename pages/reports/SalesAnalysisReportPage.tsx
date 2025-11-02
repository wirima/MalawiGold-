import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSalesAnalysisInsights } from '../../services/geminiService';
import DashboardCard from '../../components/DashboardCard';
import { Sale, Product, Category, CartItem } from '../../types';

// Helper component for displaying data sections
const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
    </div>
);

const SalesAnalysisReportPage: React.FC = () => {
    const { sales, products, categories, hasPermission, paymentMethods } = useAuth();
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ start: '', end: today });
    const [insights, setInsights] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

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

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            if (!dateRange.start && !dateRange.end) return true;
            const saleDate = new Date(sale.date);
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            if (startDate) startDate.setHours(0, 0, 0, 0);
            const endDate = dateRange.end ? new Date(dateRange.end) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);
            
            if (startDate && saleDate < startDate) return false;
            if (endDate && saleDate > endDate) return false;
            return true;
        });
    }, [sales, dateRange]);

    const reportData = useMemo(() => {
        if (filteredSales.length === 0) {
            return {
                totalRevenue: 0,
                totalSales: 0,
                totalItemsSold: 0,
                avgSaleValue: 0,
                topProductsByQuantity: [],
                topProductsByRevenue: [],
                categoryPerformance: [],
                paymentMethodPerformance: [],
            };
        }

        const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
        const totalSales = filteredSales.length;
        
        let totalItemsSold = 0;
        const productPerformance: Record<string, { quantity: number; revenue: number }> = {};
        const categoryPerformance: Record<string, { revenue: number }> = {};
        const paymentMethodPerformance: Record<string, { revenue: number }> = {};
        const productsMap: Map<string, Product> = new Map(products.map(p => [p.id, p]));
        const categoriesMap: Map<string, string> = new Map(categories.map(c => [c.id, c.name]));
        const paymentMethodsMap = new Map(paymentMethods.map(p => [p.id, p.name]));


        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                totalItemsSold += item.quantity;
                
                if (!productPerformance[item.id]) {
                    productPerformance[item.id] = { quantity: 0, revenue: 0 };
                }
                productPerformance[item.id].quantity += item.quantity;
                productPerformance[item.id].revenue += item.quantity * item.price;

                const productDetails = productsMap.get(item.id);
                if(productDetails){
                    if(!categoryPerformance[productDetails.categoryId]){
                         categoryPerformance[productDetails.categoryId] = { revenue: 0 };
                    }
                    categoryPerformance[productDetails.categoryId].revenue += item.quantity * item.price;
                }
            });

            if (!paymentMethodPerformance[sale.paymentMethodId]) {
                paymentMethodPerformance[sale.paymentMethodId] = { revenue: 0 };
            }
            paymentMethodPerformance[sale.paymentMethodId].revenue += sale.total;
        });

        const topProducts = Object.entries(productPerformance).map(([id, data]) => ({
            id,
            name: productsMap.get(id)?.name || 'Unknown Product',
            ...data
        }));
        
        return {
            totalRevenue,
            totalSales,
            totalItemsSold,
            avgSaleValue: totalRevenue / totalSales,
            topProductsByQuantity: [...topProducts].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
            topProductsByRevenue: [...topProducts].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
            categoryPerformance: Object.entries(categoryPerformance).map(([id, data]) => ({
                id,
                name: categoriesMap.get(id) || 'Unknown Category',
                ...data
            })).sort((a, b) => b.revenue - a.revenue),
            paymentMethodPerformance: Object.entries(paymentMethodPerformance).map(([id, data]) => ({
                id,
                name: paymentMethodsMap.get(id) || 'Unknown',
                ...data
            })).sort((a, b) => b.revenue - a.revenue),
        };
    }, [filteredSales, products, categories, paymentMethods]);

    const handleGenerateInsights = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setInsights('');
        try {
            const result = await getSalesAnalysisInsights(filteredSales, dateRange);
            setInsights(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [filteredSales, dateRange]);
    
    const dateInputClasses = "w-full pl-3 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";
    
    const Icon: React.FC<{ path: string }> = ({ path }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Sales Analysis Report</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed analysis of sales performance.</p>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="start" className="text-sm font-medium text-slate-600 dark:text-slate-300">Start Date</label>
                        <input type="date" name="start" id="start" value={dateRange.start} onChange={handleDateChange} className={`${dateInputClasses} mt-1`} />
                    </div>
                    <div>
                        <label htmlFor="end" className="text-sm font-medium text-slate-600 dark:text-slate-300">End Date</label>
                        <input type="date" name="end" id="end" value={dateRange.end} onChange={handleDateChange} className={`${dateInputClasses} mt-1`} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Revenue" value={reportData.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<Icon path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 014.5 4.5h-.75m16.5 0h.75a.75.75 0 01.75.75v.75h-.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0h-.75a.75.75 0 01-.75-.75V6h.75m0 0v-.75a.75.75 0 01.75-.75h.75M9 7.5h6m-6 3h6m-6 3h6m-6 3h6m-6 3h6" />} />
                <DashboardCard title="Total Sales" value={reportData.totalSales.toString()} icon={<Icon path="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />} />
                <DashboardCard title="Average Sale Value" value={reportData.avgSaleValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />} />
                <DashboardCard title="Total Items Sold" value={reportData.totalItemsSold.toString()} icon={<Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportSection title="Top Products by Quantity">
                    <ul className="space-y-3">
                        {reportData.topProductsByQuantity.length > 0 ? reportData.topProductsByQuantity.map(p => (
                            <li key={p.id} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                                <span className="font-semibold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{p.quantity} sold</span>
                            </li>
                        )) : <p className="text-slate-500 text-center py-4">No data available for this period.</p>}
                    </ul>
                </ReportSection>
                 <ReportSection title="Top Products by Revenue">
                     <ul className="space-y-3">
                        {reportData.topProductsByRevenue.length > 0 ? reportData.topProductsByRevenue.map(p => (
                            <li key={p.id} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                                <span className="font-semibold text-green-600">{p.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </li>
                        )) : <p className="text-slate-500 text-center py-4">No data available for this period.</p>}
                    </ul>
                </ReportSection>
                <ReportSection title="Sales by Category">
                     <ul className="space-y-3">
                        {reportData.categoryPerformance.length > 0 ? reportData.categoryPerformance.map(c => (
                            <li key={c.id} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                                <span className="font-semibold text-indigo-600">{c.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </li>
                        )) : <p className="text-slate-500 text-center py-4">No data available for this period.</p>}
                    </ul>
                </ReportSection>
                 <ReportSection title="Revenue by Payment Method">
                    <ul className="space-y-3">
                        {reportData.paymentMethodPerformance.length > 0 ? reportData.paymentMethodPerformance.map(p => (
                            <li key={p.id} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                                <span className="font-semibold text-purple-600 dark:text-purple-400">{p.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </li>
                        )) : <p className="text-slate-500 text-center py-4">No data available for this period.</p>}
                    </ul>
                </ReportSection>
            </div>
            
            <ReportSection title="AI-Powered Analysis">
                <p className="text-slate-600 dark:text-slate-400 mb-4">Click the button to get AI-powered analysis of your sales data for the selected period.</p>
                <button onClick={handleGenerateInsights} disabled={isLoading || filteredSales.length === 0} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center">
                    {isLoading ? (
                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                    ) : 'Generate Analysis'}
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {insights && (
                    <div className="mt-6 prose prose-slate dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg font-sans text-sm">{insights}</pre>
                    </div>
                )}
            </ReportSection>
        </div>
    );
};

export default SalesAnalysisReportPage;