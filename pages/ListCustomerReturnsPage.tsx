import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CustomerReturn } from '../types';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

type SortableKeys = 'date' | 'id' | 'originalSaleId' | 'customerName' | 'total';
type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: SortableKeys;
    direction: SortDirection;
} | null;

const ListCustomerReturnsPage: React.FC = () => {
    const { customerReturns, hasPermission } = useAuth();
    const { formatCurrency } = useCurrency();
    
    const canManage = hasPermission('returns:manage');
    const canView = hasPermission('returns:view');

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    
    const sortedReturns = useMemo(() => {
        let items = [...customerReturns];
        if (sortConfig !== null) {
            items.sort((a, b) => {
                let aValue: string | number, bValue: string | number;

                switch (sortConfig.key) {
                    case 'customerName': aValue = a.customer.name; bValue = b.customer.name; break;
                    case 'date': aValue = new Date(a.date).getTime(); bValue = new Date(b.date).getTime(); break;
                    default: aValue = a[sortConfig.key]; bValue = b[sortConfig.key];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return items;
    }, [customerReturns, sortConfig]);

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to view customer returns.
                </p>
            </div>
        );
    }
    
    // Incomplete component in source - finishing it based on similar list pages
    return (
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Customer Returns</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Review your customer return history.</p>
                    </div>
                    <Link
                        to="/sell/returns/add"
                        className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => !canManage && e.preventDefault()}
                        aria-disabled={!canManage}
                        title={!canManage ? "You don't have permission to add returns" : ""}
                    >
                        Add Return
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Return ID</th>
                            <th scope="col" className="px-6 py-3">Original Sale ID</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Reason</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Refund</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedReturns.length > 0 ? sortedReturns.map((ret: CustomerReturn) => (
                            <tr key={ret.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(ret.date).toLocaleString()}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{ret.id}</th>
                                <td className="px-6 py-4">{ret.originalSaleId}</td>
                                <td className="px-6 py-4">{ret.customer.name}</td>
                                <td className="px-6 py-4 max-w-xs truncate" title={ret.reason}>{ret.reason}</td>
                                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(ret.total)}</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No customer returns found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListCustomerReturnsPage;