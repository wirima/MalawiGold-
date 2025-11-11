

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';

const ExpenseReportPage: React.FC = () => {
    const { expenses, expenseCategories, hasPermission } = useAuth();
    const { formatCurrency } = useCurrency();
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ start: '', end: today });
    const [categoryFilter, setCategoryFilter] = useState('all');

    if (!hasPermission('reports:view')) {
        return <div className="text-center p-8">Access Denied. You do not have permission to view reports.</div>;
    }

    const categoriesMap = useMemo(() => new Map(expenseCategories.map(c => [c.id, c.name])), [expenseCategories]);

    const filteredExpenses = useMemo(() => {
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);

        return expenses.filter(exp => 
            (categoryFilter === 'all' || exp.categoryId === categoryFilter) &&
            (!startDate || new Date(exp.date) >= startDate) &&
            (!endDate || new Date(exp.date) <= endDate)
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, dateRange, categoryFilter]);

    const summaryData = useMemo(() => {
        const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        // FIX: Explicitly type the initial value of the `reduce` method to ensure correct type inference for `byCategory`, resolving downstream sort function errors.
        const byCategory = filteredExpenses.reduce<Record<string, number>>((acc, exp) => {
            const catName = categoriesMap.get(exp.categoryId) || 'Uncategorized';
            acc[catName] = (acc[catName] || 0) + exp.amount;
            return acc;
        }, {});

        return { total, byCategory: Object.entries(byCategory).sort(([,a], [,b]) => b - a) };
    }, [filteredExpenses, categoriesMap]);
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Expense Report</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Analyze your business expenditures.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="date" name="start" value={dateRange.start} onChange={e => setDateRange(p=>({...p, start: e.target.value}))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"/>
                    <input type="date" name="end" value={dateRange.end} onChange={e => setDateRange(p=>({...p, end: e.target.value}))} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"/>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"><option value="all">All Categories</option>{expenseCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md text-center">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
                <p className="text-4xl font-bold text-red-500 mt-1">{formatCurrency(summaryData.total)}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                     <h3 className="text-xl font-semibold p-6">Expense Log</h3>
                     <div className="overflow-x-auto"><table className="w-full text-sm">...</table></div>
                     <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0"><tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Description</th><th className="px-6 py-3 text-right">Amount</th></tr></thead>
                            <tbody>
                                {filteredExpenses.map(exp => <tr key={exp.id} className="border-b dark:border-slate-700">
                                    <td className="px-6 py-4">{new Date(exp.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{categoriesMap.get(exp.categoryId)}</td>
                                    <td className="px-6 py-4">{exp.description}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(exp.amount)}</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold p-6">Summary by Category</h3>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                             <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300"><tr><th className="px-6 py-3">Category</th><th className="px-6 py-3 text-right">Total</th></tr></thead>
                            <tbody>
                                {summaryData.byCategory.map(([name, total]) => <tr key={name} className="border-b dark:border-slate-700">
                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{name}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(total)}</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExpenseReportPage;