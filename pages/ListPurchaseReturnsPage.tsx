import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PurchaseReturn } from '../types';
import { Link } from 'react-router-dom';

type SortableKeys = 'date' | 'id' | 'supplierName' | 'total';
type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: SortableKeys;
    direction: SortDirection;
} | null;

const ListPurchaseReturnsPage: React.FC = () => {
    const { purchaseReturns, suppliers, hasPermission } = useAuth();
    
    const canManage = hasPermission('purchases:manage');
    const canView = hasPermission('purchases:view');

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const isFiltered = useMemo(() => {
        return supplierFilter !== 'all' || dateRange.start !== '' || dateRange.end !== '' || searchTerm !== '';
    }, [supplierFilter, dateRange, searchTerm]);

    const sortedAndFilteredReturns = useMemo(() => {
        let items = [...purchaseReturns];

        if (searchTerm.trim()) {
            const lowercasedFilter = searchTerm.trim().toLowerCase();
            items = items.filter(p => 
                p.id.toLowerCase().includes(lowercasedFilter) ||
                p.supplier.name.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (supplierFilter !== 'all') {
            items = items.filter(p => p.supplier.id === supplierFilter);
        }
        if (dateRange.start) {
            items = items.filter(p => new Date(p.date) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            items = items.filter(p => new Date(p.date) <= endDate);
        }

        if (sortConfig !== null) {
            items.sort((a, b) => {
                let aValue: string | number, bValue: string | number;
                switch (sortConfig.key) {
                    case 'supplierName': aValue = a.supplier.name; bValue = b.supplier.name; break;
                    case 'date': aValue = new Date(a.date).getTime(); bValue = new Date(b.date).getTime(); break;
                    default: aValue = a[sortConfig.key]; bValue = b[sortConfig.key];
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [purchaseReturns, searchTerm, supplierFilter, dateRange, sortConfig]);
    
    const noResultsMessage = useMemo(() => {
        if (sortedAndFilteredReturns.length > 0) return '';
        if (!isFiltered && purchaseReturns.length === 0) return 'No purchase returns have been recorded yet.';
        return 'No purchase returns found matching the current criteria.';
    }, [sortedAndFilteredReturns.length, isFiltered, purchaseReturns.length]);

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

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleResetFilters = () => {
        setSortConfig({ key: 'date', direction: 'descending' });
        setSupplierFilter('all');
        setDateRange({ start: '', end: '' });
        setSearchTerm('');
    };

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to view purchase returns.
                </p>
            </div>
        );
    }
    
    const dateInputClasses = "w-full pl-3 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";
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
                        <h1 className="text-2xl font-bold">Purchase Returns</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Review your purchase return history.</p>
                    </div>
                    <Link
                        to="/purchases/returns/add"
                        className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => !canManage && e.preventDefault()}
                        aria-disabled={!canManage}
                        title={!canManage ? "You don't have permission to add purchase returns" : ""}
                    >
                        Add Purchase Return
                    </Link>
                </div>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label htmlFor="searchTerm" className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">Search by ID or Supplier</label>
                        <input 
                           type="text" 
                           id="searchTerm"
                           placeholder="Search by ID or Supplier..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                     <div>
                         <label htmlFor="start" className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">Start Date</label>
                        <input type="date" name="start" id="start" value={dateRange.start} onChange={handleDateChange} className={dateInputClasses} />
                    </div>
                    <div>
                        <label htmlFor="end" className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">End Date</label>
                        <input type="date" name="end" id="end" value={dateRange.end} onChange={handleDateChange} className={dateInputClasses} />
                    </div>
                    <div>
                        <button
                            onClick={handleResetFilters}
                            disabled={!isFiltered}
                            className="w-full px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <SortableHeader sortKey="date">Date</SortableHeader>
                            <SortableHeader sortKey="id">Return ID</SortableHeader>
                            <SortableHeader sortKey="supplierName">Supplier</SortableHeader>
                            <SortableHeader sortKey="total" className="text-right">Total Amount</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredReturns.length > 0 ? sortedAndFilteredReturns.map((pr: PurchaseReturn) => (
                            <tr key={pr.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4">{new Date(pr.date).toLocaleString()}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{pr.id}</th>
                                <td className="px-6 py-4">{pr.supplier.name}</td>
                                <td className="px-6 py-4 text-right font-semibold">{pr.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    {noResultsMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListPurchaseReturnsPage;
