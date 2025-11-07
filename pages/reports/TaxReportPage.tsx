
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CartItem } from '../../types';
import DashboardCard from '../../components/DashboardCard';
import { useCurrency } from '../../contexts/CurrencyContext';

const TaxReportPage: React.FC = () => {
    const { sales, purchases, purchaseReturns, customerReturns, hasPermission } = useAuth();
    const { formatCurrency } = useCurrency();
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

        const calculateTax = (item: CartItem, priceField: 'price' | 'costPrice'): number => {
            const basePrice = item[priceField];
            let taxPerItem = 0;
            if (item.taxType === 'percentage' && item.taxAmount) {
                taxPerItem = basePrice * (item.taxAmount / 100);
            } else if (item.taxType === 'fixed' && item.taxAmount) {
                taxPerItem = item.taxAmount;
            }
            return taxPerItem * item.quantity;
        };

        // Output Tax (from sales)
        const salesTax = sales
            .filter(s => s.status === 'completed')
            .filter(filterByDate)
            .reduce((totalTax, sale) => {
                const saleTax = sale.items.reduce((acc, item) => acc + calculateTax(item, 'price'), 0);
                return totalTax + saleTax;
            }, 0);

        const salesReturnTax = customerReturns
            .filter(filterByDate)
            .reduce((totalTax, ret) => {
                const returnTax = ret.items.reduce((acc, item) => acc + calculateTax(item, 'price'), 0);
                return totalTax + returnTax;
            }, 0);
            
        const totalOutputTax = salesTax - salesReturnTax;

        // Input Tax (from purchases)
        const purchaseTax = purchases
            .filter(filterByDate)
            .reduce((totalTax, purchase) => {
                const pTax = purchase.items.reduce((acc, item) => acc + calculateTax(item, 'costPrice'), 0);
                return totalTax + pTax;
            }, 0);

        const purchaseReturnTax = purchaseReturns
            .filter(filterByDate)
            .reduce((totalTax, ret) => {
                const prTax = ret.items.reduce((acc, item) => acc + calculateTax(item, 'costPrice'), 0);
                return totalTax + prTax;
            }, 0);

        const totalInputTax = purchaseTax - purchaseReturnTax;

        const netTaxPayable = totalOutputTax - totalInputTax;

        return {
            totalOutputTax,
            totalInputTax,
            netTaxPayable
        };

    }, [sales, purchases, customerReturns, purchaseReturns, dateRange]);

    const Icon: React.FC<{ path: string }> = ({ path }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Tax Report</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Summary of input and output tax for a given period.</p>
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
                <DashboardCard title="Total Output Tax (Sales)" value={formatCurrency(reportData.totalOutputTax)} icon={<Icon path="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />} />
                <DashboardCard title="Total Input Tax (Purchases)" value={formatCurrency(reportData.totalInputTax)} icon={<Icon path="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />} />
            </div>

             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Net Tax Payable</h3>
                    <p className={`text-3xl font-bold ${reportData.netTaxPayable >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(reportData.netTaxPayable)}
                    </p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    This is the difference between tax collected on sales (Output Tax) and tax paid on purchases (Input Tax).
                    A positive value indicates tax owed to the government. A negative value indicates a potential tax refund.
                </p>
                 <div className="mt-4 pt-4 border-t dark:border-slate-700 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Total Output Tax</span>
                        <span>{formatCurrency(reportData.totalOutputTax)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Less: Total Input Tax</span>
                        <span>- {formatCurrency(reportData.totalInputTax)}</span>
                    </div>
                     <div className="flex justify-between font-bold mt-2 pt-2 border-t dark:border-slate-700">
                        <span>Net Tax</span>
                        <span>{formatCurrency(reportData.netTaxPayable)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxReportPage;