import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StockTransfer } from '../types';
import { Link } from 'react-router-dom';

type SortableKeys = 'date' | 'id' | 'from' | 'to' | 'status';
type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: SortableKeys;
    direction: SortDirection;
} | null;

const StockTransfersPage: React.FC = () => {
    const { stockTransfers, businessLocations, hasPermission } = useAuth();
    
    const canManage = hasPermission('stock_transfer:manage');
    const canView = hasPermission('stock_transfer:view');

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    const [locationFilter, setLocationFilter] = useState('all');
    
    const locationsMap = useMemo(() => new Map(businessLocations.map(loc => [loc.id, loc.name])), [businessLocations]);

    const sortedAndFilteredTransfers = useMemo(() => {
        let items = [...stockTransfers];
        
        if (locationFilter !== 'all') {
            items = items.filter(t => t.fromLocationId === locationFilter || t.toLocationId === locationFilter);
        }

        if (sortConfig !== null) {
            items.sort((a, b) => {
                let aValue: string | number, bValue: string | number;
                switch (sortConfig.key) {
                    case 'from': aValue = locationsMap.get(a.fromLocationId) || ''; bValue = locationsMap.get(b.fromLocationId) || ''; break;
                    case 'to': aValue = locationsMap.get(a.toLocationId) || ''; bValue = locationsMap.get(b.toLocationId) || ''; break;
                    case 'date': aValue = new Date(a.date).getTime(); bValue = new Date(b.date).getTime(); break;
                    default: aValue = a[sortConfig.key]; bValue = b[sortConfig.key];
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [stockTransfers, locationFilter, sortConfig, locationsMap]);
    
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
                    You do not have permission to view stock transfers.
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
                        <h1 className="text-2xl font-bold">Stock Transfers</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Review your inventory transfer history.</p>
                    </div>
                    <Link
                        to="/stock-transfers/add"
                        className={`inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => !canManage && e.preventDefault()}
                        aria-disabled={!canManage}
                        title={!canManage ? "You don't have permission to add transfers" : ""}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Stock Transfer
                    </Link>
                </div>
                 <div className="mt-4">
                     <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="w-full max-w-xs pl-4 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="all">All Locations</option>
                        {businessLocations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <SortableHeader sortKey="date">Date</SortableHeader>
                            <SortableHeader sortKey="id">Reference No</SortableHeader>
                            <SortableHeader sortKey="from">Location (From)</SortableHeader>
                            <SortableHeader sortKey="to">Location (To)</SortableHeader>
                            <SortableHeader sortKey="status">Status</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredTransfers.length > 0 ? sortedAndFilteredTransfers.map((transfer: StockTransfer) => (
                            <tr key={transfer.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4">{new Date(transfer.date).toLocaleString()}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{transfer.id}</th>
                                <td className="px-6 py-4">{locationsMap.get(transfer.fromLocationId)}</td>
                                <td className="px-6 py-4">{locationsMap.get(transfer.toLocationId)}</td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                        transfer.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    }`}>
                                        {transfer.status.replace('_', ' ')}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No stock transfers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTransfersPage;