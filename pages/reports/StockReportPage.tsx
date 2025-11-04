
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import DashboardCard from '../../components/DashboardCard';

type SortableKeys = 'name' | 'sku' | 'categoryName' | 'brandName' | 'stock' | 'costValue' | 'priceValue';
type SortDirection = 'ascending' | 'descending';

const StockReportPage: React.FC = () => {
    const { products, brands, categories, businessLocations, hasPermission } = useAuth();
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: SortDirection }>({ key: 'name', direction: 'ascending' });
    const [filters, setFilters] = useState({ category: 'all', brand: 'all', location: 'all', status: 'all' });

    if (!hasPermission('reports:view')) {
        return <div className="text-center p-8">Access Denied. You do not have permission to view reports.</div>;
    }

    const brandsMap = useMemo(() => new Map(brands.map(b => [b.id, b.name])), [brands]);
    const categoriesMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
    const locationsMap = useMemo(() => new Map(businessLocations.map(l => [l.id, l.name])), [businessLocations]);

    const processedProducts = useMemo(() => {
        let filtered = products.filter(p => 
            (filters.category === 'all' || p.categoryId === filters.category) &&
            (filters.brand === 'all' || p.brandId === filters.brand) &&
            (filters.location === 'all' || p.businessLocationId === filters.location)
        );

        if (filters.status !== 'all') {
            filtered = filtered.filter(p => {
                if (filters.status === 'in_stock') return p.stock > p.reorderPoint;
                if (filters.status === 'low_stock') return p.stock > 0 && p.stock <= p.reorderPoint;
                if (filters.status === 'out_of_stock') return p.stock === 0;
                return true;
            });
        }
        
        return filtered.map(p => ({
            ...p,
            categoryName: categoriesMap.get(p.categoryId) || '',
            brandName: brandsMap.get(p.brandId) || '',
            locationName: locationsMap.get(p.businessLocationId) || '',
            costValue: p.stock * p.costPrice,
            priceValue: p.stock * p.price,
        }));
    }, [products, filters, brandsMap, categoriesMap, locationsMap]);

    const sortedProducts = useMemo(() => {
        const sortableItems = [...processedProducts];
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [processedProducts, sortConfig]);

    const summaryData = useMemo(() => {
        const totalCostValue = processedProducts.reduce((sum, p) => sum + p.costValue, 0);
        const totalPriceValue = processedProducts.reduce((sum, p) => sum + p.priceValue, 0);
        const lowStockItems = processedProducts.filter(p => p.stock > 0 && p.stock <= p.reorderPoint).length;
        const outOfStockItems = processedProducts.filter(p => p.stock === 0).length;
        return { totalCostValue, totalPriceValue, lowStockItems, outOfStockItems };
    }, [processedProducts]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const requestSort = (key: SortableKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getStockStatus = (product: Product) => {
        if (product.stock === 0) return { text: 'Out of Stock', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        if (product.stock <= product.reorderPoint) return { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        return { text: 'In Stock', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    };

    const Icon: React.FC<{ path: string }> = ({ path }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>;
    const formatCurrency = (val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold">Stock Report</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">View current inventory levels and values.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"><option value="all">All Categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <select name="brand" value={filters.brand} onChange={handleFilterChange} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"><option value="all">All Brands</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                    <select name="location" value={filters.location} onChange={handleFilterChange} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"><option value="all">All Locations</option>{businessLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-indigo-500"><option value="all">All Statuses</option><option value="in_stock">In Stock</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option></select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Stock Value (Cost)" value={formatCurrency(summaryData.totalCostValue)} icon={<Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />} />
                <DashboardCard title="Stock Value (Price)" value={formatCurrency(summaryData.totalPriceValue)} icon={<Icon path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75m0 0a3.75 3.75 0 00-3.75-3.75H5.625a3.75 3.75 0 00-3.75 3.75m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 16.91a2.25 2.25 0 01-1.07-1.916V15" />} />
                <DashboardCard title="Low Stock Items" value={summaryData.lowStockItems.toString()} icon={<Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />} />
                <DashboardCard title="Out of Stock Items" value={summaryData.outOfStockItems.toString()} icon={<Icon path="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                {(['name', 'sku', 'categoryName', 'brandName', 'stock', 'costValue', 'priceValue'] as SortableKeys[]).map(key => 
                                    <th key={key} scope="col" className="px-6 py-3"><button onClick={() => requestSort(key)} className="font-semibold flex items-center gap-1">{key.replace(/([A-Z])/g, ' $1').replace('Value', ' Value').replace('Name', '').trim().toUpperCase()} {sortConfig.key === key ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '▲▼'}</button></th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.map(p => (
                                <tr key={p.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                    <td className="px-6 py-4">{p.sku}</td>
                                    <td className="px-6 py-4">{p.categoryName}</td>
                                    <td className="px-6 py-4">{p.brandName}</td>
                                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatus(p).className}`}>{p.stock}</span></td>
                                    <td className="px-6 py-4 font-mono">{formatCurrency(p.costValue)}</td>
                                    <td className="px-6 py-4 font-mono">{formatCurrency(p.priceValue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockReportPage;
