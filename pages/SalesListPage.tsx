

import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sale } from '../types';
import { Link } from 'react-router-dom';

type SortableKeys = 'date' | 'id' | 'customerName' | 'total';
type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: SortableKeys;
    direction: SortDirection;
} | null;

const SalesListPage: React.FC = () => {
    const { sales, customers, hasPermission, paymentMethods } = useAuth();
    
    const canManageSales = hasPermission('sell:manage');
    const canViewSales = hasPermission('sell:sales');

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    const [customerFilter, setCustomerFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    const paymentMethodsMap = useMemo(() => new Map(paymentMethods.map(p => [p.id, p.name])), [paymentMethods]);

    const sortedAndFilteredSales = useMemo(() => {
        let filterableSales = [...sales];

        // Search Logic
        if (searchTerm.trim()) {
            filterableSales = filterableSales.filter(sale =>
                sale.id.toLowerCase().includes(searchTerm.trim().toLowerCase())
            );
        }

        // Filtering Logic
        if (customerFilter !== 'all') {
            filterableSales = filterableSales.filter(sale => sale.customer.id === customerFilter);
        }
        if (dateRange.start) {
            filterableSales = filterableSales.filter(sale => new Date(sale.date) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999); // Include the entire end day
            filterableSales = filterableSales.filter(sale => new Date(sale.date) <= endDate);
        }

        // Sorting Logic
        if (sortConfig !== null) {
            filterableSales.sort((a, b) => {
                let aValue: string | number, bValue: string | number;

                switch (sortConfig.key) {
                    case 'customerName':
                        aValue = a.customer.name;
                        bValue = b.customer.name;
                        break;
                    case 'date':
                        aValue = new Date(a.date).getTime();
                        bValue = new Date(b.date).getTime();
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
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

        return filterableSales;
    }, [sales, customerFilter, dateRange, sortConfig, searchTerm]);

    const requestSort = (key: SortableKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="text-slate-400">▲▼</span>;
        }
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (!canViewSales) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to view sales.
                </p>
            </div>
        );
    }
    
    const selectClasses = "w-full pl-4 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";
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
                        <h1 className="text-2xl font-bold">All Sales</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and filter your sales history.</p>
                    </div>
                    <Link
                        to="/sell/add"
                        className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap ${!canManageSales ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => !canManageSales && e.preventDefault()}
                        aria-disabled={!canManageSales}
                        title={!canManageSales ? "You don't have permission to add sales" : ""}
                    >
                        Add Sale
                    </Link>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div>
                        <label htmlFor="searchTerm" className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">Search by Sale ID</label>
                        <input 
                           type="text" 
                           id="searchTerm"
                           placeholder="Search by Sale ID..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="customerFilter" className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">Customer</label>
                        <select id="customerFilter" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className={selectClasses}>
                            <option value="all">All Customers</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                         <label htmlFor="start" className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">Start Date</label>
                        <input type="date" name="start" id="start" value={dateRange.start} onChange={handleDateChange} className={dateInputClasses} />
                    </div>
                    <div>
                        <label htmlFor="end" className="text-sm font-medium text-slate-600 dark:text-slate-300 sr-only">End Date</label>
                        <input type="date" name="end" id="end" value={dateRange.end} onChange={handleDateChange} className={dateInputClasses} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <SortableHeader sortKey="date">Sale Details</SortableHeader>
                            <SortableHeader sortKey="customerName">Customer</SortableHeader>
                            <SortableHeader sortKey="total" className="text-right">Total Amount</SortableHeader>
                            <th scope="col" className="px-6 py-3">Payment Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredSales.length > 0 ? sortedAndFilteredSales.map((sale: Sale) => (
                            <tr key={sale.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900 dark:text-white">{sale.id}</div>
                                    <div className="text-slate-500">{new Date(sale.date).toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{sale.customer.name}</div>
                                    {(sale.passportNumber || sale.nationality) && (
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {sale.passportNumber} ({sale.nationality})
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold">{sale.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td className="px-6 py-4">{paymentMethodsMap.get(sale.paymentMethodId) || 'N/A'}</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No sales found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesListPage;