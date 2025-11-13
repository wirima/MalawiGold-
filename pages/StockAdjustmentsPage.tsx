import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StockAdjustment, StockAdjustmentType } from '../types';
import { Link } from 'react-router-dom';
import { downloadCSV } from '../utils';

type SortableKeys = 'date' | 'productName' | 'type' | 'quantity' | 'reason';
type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: SortableKeys;
    direction: SortDirection;
} | null;

const StockAdjustmentsPage: React.FC = () => {
    const { stockAdjustments, products, hasPermission } = useAuth();
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    const [productFilter, setProductFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState<'all' | StockAdjustmentType>('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const canManage = hasPermission('stock_adjustment:manage');
    const canView = hasPermission('stock_adjustment:view');
    
    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p.name])), [products]);

    const isFiltered = useMemo(() => productFilter !== 'all' || typeFilter !== 'all' || dateRange.start !== '' || dateRange.end !== '', [productFilter, typeFilter, dateRange]);

    const sortedAndFilteredAdjustments = useMemo(() => {
        let items = stockAdjustments.map(adj => ({
            ...adj,
            productName: productsMap.get(adj.productId) || 'Unknown Product'
        }));

        // Filtering
        if (productFilter !== 'all') {
            items = items.filter(adj => adj.productId === productFilter);
        }
        if (typeFilter !== 'all') {
            items = items.filter(adj => adj.type === typeFilter);
        }
        if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            startDate.setHours(0, 0, 0, 0);
            items = items.filter(adj => new Date(adj.date) >= startDate);
        }
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            items = items.filter(adj => new Date(adj.date) <= endDate);
        }

        if (sortConfig !== null) {
            items.sort((a, b) => {
                const { key, direction } = sortConfig;
                const asc = direction === 'ascending' ? 1 : -1;

                const aValue = a[key];
                const bValue = b[key];

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return (aValue - bValue) * asc;
                }
                
                if (key === 'date') {
                     return (new Date(a.date).getTime() - new Date(b.date).getTime()) * asc;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return aValue.localeCompare(bValue, undefined, { sensitivity: 'base' }) * asc;
                }

                return 0;
            });
        }

        return items;
    }, [stockAdjustments, productsMap, sortConfig, productFilter, typeFilter, dateRange]);

    const requestSort = (key: SortableKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };
    
    const handleClearFilters = () => {
        setProductFilter('all');
        setTypeFilter('all');
        setDateRange({ start: '', end: '' });
    };

    // FIX: Add handleDownloadCsv and handleDownloadExcel functions
    const handleDownloadCsv = () => {
        const headers = ['date', 'product_name', 'sku', 'type', 'quantity', 'reason'];
        const data = sortedAndFilteredAdjustments.map(adj => [
            new Date(adj.date).toLocaleString(),
            adj.productName,
            products.find(p => p.id === adj.productId)?.sku || 'N/A',
            adj.type,
            adj.quantity,
            adj.reason
        ]);
        downloadCSV('stock_adjustments.csv', headers, data);
    };

    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="text-slate-400">▲▼</span>;
        }
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };
    
    const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode }> = ({ sortKey, children }) => (
         <th scope="col" className="px-6 py-3">
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 uppercase font-semibold">
                {children}
                <span className="text-indigo-400">{getSortIndicator(sortKey)}</span>
            </button>
        </th>
    );

    if (!canView) {
        return (
           <div className="flex flex-col items-center justify-center h-full text-center">
               <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
               <p className="mt-4 text-slate-500 dark:text-slate-400">
                   You do not have permission to view this page.
               </p>
           </div>
       );
   }
   
    const filterInputClasses = "w-full pl-4 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";


    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Stock Adjustments</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your inventory changes.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadCsv} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold whitespace-nowrap">
                            Export CSV
                        </button>
                        <Link
                            to="/app/stock-adjustments/add"
                            className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => !canManage && e.preventDefault()}
                            aria-disabled={!canManage}
                            title={!canManage ? "You don't have permission to add stock adjustments" : ""}
                        >
                            Add Stock Adjustment
                        </Link>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <label htmlFor="productFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product</label>
                        <select id="productFilter" value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className={`${filterInputClasses} mt-1`}>
                            <option value="all">All Products</option>
                            {products.map(product => ( <option key={product.id} value={product.id}>{product.name} ({product.sku})</option> ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="typeFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                        <select id="typeFilter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className={`${filterInputClasses} mt-1`}>
                            <option value="all">All Types</option>
                            <option value="addition">Addition</option>
                            <option value="subtraction">Subtraction</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                        <input type="date" id="startDate" name="start" value={dateRange.start} onChange={handleDateChange} className={`${filterInputClasses} mt-1`} />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                        <input type="date" id="endDate" name="end" value={dateRange.end} onChange={handleDateChange} className={`${filterInputClasses} mt-1`} />
                    </div>
                </div>
                 <div className="mt-2 flex justify-end">
                    <button onClick={handleClearFilters} disabled={!isFiltered} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                        Clear Filters
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <SortableHeader sortKey="date">Date</SortableHeader>
                            <SortableHeader sortKey="productName">Product</SortableHeader>
                            <SortableHeader sortKey="type">Type</SortableHeader>
                            <SortableHeader sortKey="quantity">Quantity</SortableHeader>
                            <SortableHeader sortKey="reason">Reason</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredAdjustments.map(adj => (
                            <tr key={adj.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(adj.date).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{adj.productName}</td>
                                <td className="px-6 py-4">
                                    <span className={`capitalize px-2 py-1 text-xs font-medium rounded-full ${adj.type === 'addition' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                        {adj.type}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 font-semibold ${adj.type === 'addition' ? 'text-green-600' : 'text-red-600'}`}>
                                    {adj.type === 'addition' ? '+' : '-'}{adj.quantity}
                                </td>
                                <td className="px-6 py-4">{adj.reason}</td>
                            </tr>
                        ))}
                         {sortedAndFilteredAdjustments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No stock adjustments found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockAdjustmentsPage;