import React, { useState, useCallback } from 'react';
import DashboardCard from '../components/DashboardCard';
import { getBusinessInsights } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../src/i18n';
import { useCurrency } from '../contexts/CurrencyContext';

const Dashboard: React.FC = () => {
    const { sales } = useAuth();
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [insights, setInsights] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateInsights = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setInsights('');
        try {
            const result = await getBusinessInsights(sales);
            setInsights(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [sales]);
    
    const totalRevenue = formatCurrency(sales.reduce((acc, sale) => acc + sale.total, 0));
    const totalSalesCount = sales.length.toString();

    const Icon: React.FC<{ path: string }> = ({ path }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title={t('totalRevenue')} value={totalRevenue} icon={<Icon path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 014.5 4.5h-.75m16.5 0h.75a.75.75 0 01.75.75v.75h-.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0h-.75a.75.75 0 01-.75-.75V6h.75m0 0v-.75a.75.75 0 01.75-.75h.75M9 7.5h6m-6 3h6m-6 3h6m-6 3h6m-6 3h6" />} change="+12% this month" changeType="positive" />
                <DashboardCard title={t('totalSales')} value={totalSalesCount} icon={<Icon path="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />} change="+5 sales today" changeType="positive" />
                <DashboardCard title={t('newCustomers')} value="8" icon={<Icon path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.68c.11.31.201.623.272.946M9 12.75a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0z" />} change="-2 this week" changeType="negative" />
                <DashboardCard title={t('pendingOrders')} value="3" icon={<Icon path="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">{t('smartBusinessInsights')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Click the button to get AI-powered analysis of your recent sales data and receive actionable recommendations.</p>
                    <button onClick={handleGenerateInsights} disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center">
                        {isLoading ? (
                           <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                        ) : t('getInsights')}
                    </button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    {insights && (
                        <div className="mt-6 prose prose-slate dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg"
                             dangerouslySetInnerHTML={{ __html: insights }}
                        />
                    )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                     <h2 className="text-xl font-semibold mb-4">{t('recentSales')}</h2>
                     <ul className="space-y-4">
                        {sales.slice(0, 5).map(sale => (
                            <li key={sale.id} className="flex items-center justify-between">
                               <div>
                                   <p className="font-semibold text-slate-800 dark:text-slate-200">{sale.customer.name}</p>
                                   <p className="text-sm text-slate-500 dark:text-slate-400">{sale.items.length} items</p>
                               </div>
                               <p className="font-bold text-lg text-indigo-500">{formatCurrency(sale.total)}</p>
                           </li>
                        ))}
                     </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;