



import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardCard from '../../components/DashboardCard';

const ProfitLossReportPage: React.FC = () => {
    const { sales, expenses, expenseCategories, customerReturns, hasPermission } = useAuth();
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
        const filteredSalesReturns = customerReturns.filter(filterByDate);
        const filteredExpenses = expenses.filter(filterByDate);

        // Net Sales Calculation (pre-tax)
        const grossSales = filteredSales.reduce((sum, sale) => {
            const subtotal = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            let discountAmount = 0;
            if (sale.discount) {
                discountAmount = sale.discount.type === 'percentage' ? (subtotal * sale.discount.value) / 100 : sale.discount.value;
            }
            return sum + (subtotal - discountAmount);
        }, 0);

        const totalSalesReturns = filteredSalesReturns.reduce((sum, ret) => {
            const returnValue = ret.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            return sum + returnValue;
        }, 0);

        const netSales = grossSales - totalSalesReturns;
        
        // COGS Calculation
        const costOfGoodsSold = filteredSales.reduce((cogs, sale) => {
            return cogs + sale.items.reduce((itemCogs, item) => {
                return itemCogs + (item.costPrice * item.quantity);
            }, 0);
        }, 0);
        
        const costOfReturnedGoods = filteredSalesReturns.reduce((cogs, ret) => {
            return cogs + ret.items.reduce((itemCogs, item) => {
                 return itemCogs + (item.costPrice * item.quantity);
            }, 0);
        }, 0);

        const netCogs = costOfGoodsSold - costOfReturnedGoods;

        const grossProfit = netSales - netCogs;

        const expenseCategoriesMap = new Map(expenseCategories.map(c => [c.id, c.name]));
        // FIX: Explicitly type the initial value of the reduce() accumulator to ensure correct type inference for 'expensesByCat', preventing index signature and assignment errors.
        const expensesByCat = filteredExpenses.reduce((acc, exp) => {
            const catName = expenseCategoriesMap.get(exp.categoryId) || 'Uncategorized';
            acc[catName] = (acc[catName] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);
        
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const netProfit = grossProfit - totalExpenses;

        return {
            grossSales,
            totalSalesReturns,
            netSales,
            costOfGoodsSold: netCogs,
            grossProfit,
            expensesByCat,
            totalExpenses,
            netProfit
        };

    }, [sales, expenses, customerReturns, dateRange, expenseCategories]);

    const Icon: React.FC<{ path: string }> = ({ path }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
    );

    const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Profit & Loss Report</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">An overview of your business's financial performance.</p>
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

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md text-center">
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Profit / Loss</p>
                <p className={`text-4xl font-bold mt-1 ${reportData.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(reportData.netProfit)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <DashboardCard title="Net Sales" value={formatCurrency(reportData.netSales)} icon={<Icon path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 014.5 4.5h-.75m16.5 0h.75a.75.75 0 01.75.75v.75h-.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0h-.75a.75.75 0 01-.75-.75V6h.75m0 0v-.75a.75.75 0 01.75-.75h.75M9 7.5h6m-6 3h6m-6 3h6m-6 3h6m-6 3h6" />} />
                 <DashboardCard title="Cost of Goods Sold" value={formatCurrency(reportData.costOfGoodsSold)} icon={<Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />} />
                 <DashboardCard title="Total Expenses" value={formatCurrency(reportData.totalExpenses)} icon={<Icon path="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                 <h3 className="text-xl font-semibold mb-2">Profit & Loss Statement</h3>
                <div className="space-y-4 text-sm">
                    {/* Income Section */}
                    <div className="flex justify-between py-2 border-b dark:border-slate-700"><span className="text-slate-500">Gross Sales</span><span className="font-medium">{formatCurrency(reportData.grossSales)}</span></div>
                    <div className="flex justify-between py-2 border-b dark:border-slate-700"><span className="text-slate-500">Less: Sales Returns</span><span className="font-medium">({formatCurrency(reportData.totalSalesReturns)})</span></div>
                    <div className="flex justify-between py-2 font-bold"><span >Net Sales</span><span >{formatCurrency(reportData.netSales)}</span></div>
                    
                    {/* COGS Section */}
                    <div className="flex justify-between py-2 border-b dark:border-slate-700 mt-4"><span className="text-slate-500">Less: Cost of Goods Sold</span><span className="font-medium">({formatCurrency(reportData.costOfGoodsSold)})</span></div>
                    <div className="flex justify-between py-2 font-bold text-lg"><span >Gross Profit</span><span >{formatCurrency(reportData.grossProfit)}</span></div>
                    
                    {/* Expenses Section */}
                    <div className="pt-4 mt-4 border-t dark:border-slate-700">
                        <h4 className="font-bold mb-2">Expenses</h4>
                        {Object.entries(reportData.expensesByCat).map(([category, amount]) => (
                             <div key={category} className="flex justify-between py-1 text-slate-500"><span >{category}</span><span className="font-medium">({formatCurrency(amount)})</span></div>
                        ))}
                        <div className="flex justify-between py-2 border-t dark:border-slate-700 mt-2 font-bold"><span >Total Expenses</span><span >({formatCurrency(reportData.totalExpenses)})</span></div>
                    </div>
                    
                    {/* Final Net Profit */}
                     <div className="flex justify-between py-3 mt-4 border-t-2 border-slate-900 dark:border-slate-200 font-bold text-xl"><span >Net Profit / Loss</span><span className={reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(reportData.netProfit)}</span></div>

                </div>
            </div>
        </div>
    );
};

export default ProfitLossReportPage;