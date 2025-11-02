import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Purchase } from '../types';
import { Link } from 'react-router-dom';

type SortableKeys = 'date' | 'id' | 'supplierName' | 'total';
type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: SortableKeys;
    direction: SortDirection;
} | null;

const PurchasesPage: React.FC = () => {
    const { purchases, suppliers, hasPermission } = useAuth();
    
    const canManage = hasPermission('purchases:manage');
    const canView = hasPermission('purchases:view');

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const sortedAndFilteredPurchases = useMemo(() => {
        let items = [...purchases];
        if (searchTerm.trim()) items = items.filter(p => p.id.toLowerCase().includes(searchTerm.trim().toLowerCase()));
        if (supplierFilter !== 'all') items = items.filter(p => p.supplier.id === supplierFilter);
        if (dateRange.start) items = items.filter(p => new Date(p.date) >= new Date(dateRange.start));
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            items = items.filter(p => new Date(p.date) <= endDate);
        }
        if (sortConfig) {
            items.sort((a, b) => {
                let aValue: string | number;
                let bValue: string | number;
                if (sortConfig.key === 'supplierName') {
                    aValue = a.supplier.name;
                    bValue = b.supplier.name;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }
                
                if (sortConfig.key === 'date') {
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [purchases, searchTerm, supplierFilter, dateRange, sortConfig]);

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
                <p className="mt-4 text-slate-500 dark:text-slate-400">You do not have permission to view this page.</p>
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
                        <h1 className="text-2xl font-bold">List Purchases</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Review your purchase order history.</p>
                    </div>
                    <Link
                        to="/purchases/add"
                        className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => !canManage && e.preventDefault()}
                        aria-disabled={!canManage}
                    >
                        Add Purchase
                    </Link>
                </div>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input 
                       type="text" 
                       placeholder="Search by Purchase ID..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="w-full pl-4 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="all">All Suppliers</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="date" name="start" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="w-full pl-3 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="date" name="end" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="w-full pl-3 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <SortableHeader sortKey="date">Date</SortableHeader>
                            <SortableHeader sortKey="id">Purchase ID</SortableHeader>
                            <SortableHeader sortKey="supplierName">Supplier</SortableHeader>
                            <SortableHeader sortKey="total" className="text-right">Total Amount</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredPurchases.map((purchase: Purchase) => (
                            <tr key={purchase.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4">{new Date(purchase.date).toLocaleString()}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{purchase.id}</th>
                                <td className="px-6 py-4">{purchase.supplier.name}</td>
                                <td className="px-6 py-4 text-right font-semibold">{purchase.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            </tr>
                        ))}
                         {sortedAndFilteredPurchases.length === 0 && (
                             <tr><td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400">No purchases found.</td></tr>
                         )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchasesPage;
