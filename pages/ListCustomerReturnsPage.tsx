import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CustomerReturn } from '../types';
import { Link } from 'react-router-dom';

type SortableKeys = 'date' | 'id' | 'originalSaleId' | 'customerName' | 'total';
type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: SortableKeys;
    direction: SortDirection;
} | null;

const ListCustomerReturnsPage: React.FC = () => {
    const { customerReturns, hasPermission } = useAuth();
    
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

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [customerReturns, sortConfig]);
    
    const requestSort = (key: SortableKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="text-slate-400">▲▼</span>;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

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

    const SortableHeader: React.FC<{ sortKey: SortableKeys; className?: string; children: React.ReactNode }> = ({ sortKey, className, children }) => (
        <th scope="col" className={`px-6 py-3 ${className || ''}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 uppercase font-semibold">
                {children}
                <span className="text-indigo-400">{getSortIndicator(sortKey)}</span>
            </button>
        </th>
    );

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Customer Returns</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Review all processed customer returns.</p>
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
                            <SortableHeader sortKey="date">Date</SortableHeader>
                            <SortableHeader sortKey="id">Return ID</SortableHeader>
                            <SortableHeader sortKey="originalSaleId">Original Sale ID</SortableHeader>
                            <SortableHeader sortKey="customerName">Customer</SortableHeader>
                            <th scope="col" className="px-6 py-3">Reason</th>
                            <SortableHeader sortKey="total" className="text-right">Total Refunded</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedReturns.length > 0 ? sortedReturns.map((item: CustomerReturn) => (
                            <tr key={item.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4">{new Date(item.date).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.id}</td>
                                <td className="px-6 py-4">{item.originalSaleId}</td>
                                <td className="px-6 py-4">{item.customer.name}</td>
                                <td className="px-6 py-4 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                                <td className="px-6 py-4 text-right font-semibold text-red-500">
                                    -{item.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No customer returns have been recorded yet.
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