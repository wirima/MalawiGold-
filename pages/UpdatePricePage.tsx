
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { downloadCSV } from '../utils';

const UpdatePricePage: React.FC = () => {
    const { products, brands, categories, hasPermission, updateMultipleProducts } = useAuth();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [brandFilter, setBrandFilter] = useState('all');

    // State for pending price changes: Record<productId, newPrice>
    const [pendingChanges, setPendingChanges] = useState<Record<string, { costPrice?: number; price?: number }>>({});
    
    // State for percentage update
    const [percentUpdate, setPercentUpdate] = useState('');
    const [percentType, setPercentType] = useState<'increase' | 'decrease'>('increase');
    const [priceFieldToUpdate, setPriceFieldToUpdate] = useState<'price' | 'costPrice'>('price');


    const canUpdatePrice = hasPermission('products:update_price');
    const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

    // Memoized maps for performance
    const categoriesMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
    const brandsMap = useMemo(() => new Map(brands.map(b => [b.id, b.name])), [brands]);

    // Memoized filtering logic
    const filteredProducts = useMemo(() => {
        return products
            .filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(product => categoryFilter === 'all' || product.categoryId === categoryFilter)
            .filter(product => brandFilter === 'all' || product.brandId === brandFilter);
    }, [products, searchTerm, categoryFilter, brandFilter]);
    
    // Handlers
    const handlePriceChange = (productId: string, field: 'costPrice' | 'price', value: string) => {
        const price = parseFloat(value);
        if (!isNaN(price) && price >= 0) {
            setPendingChanges(prev => ({
                ...prev,
                [productId]: {
                    ...prev[productId],
                    [field]: price
                }
            }));
        }
    };
    
    const handleSaveChanges = () => {
        if (!hasUnsavedChanges) return;
        
        const updatesToSave: Pick<Product, 'id' | 'price' | 'costPrice'>[] = 
            Object.keys(pendingChanges).map(productId => {
                const product = products.find(p => p.id === productId);
                if (!product) return null;
                
                const changes = pendingChanges[productId];
                return {
                    id: productId,
                    costPrice: changes.costPrice ?? product.costPrice,
                    price: changes.price ?? product.price,
                };
            }).filter((p): p is Pick<Product, 'id' | 'price' | 'costPrice'> => p !== null);

        if (updatesToSave.length > 0) {
            updateMultipleProducts(updatesToSave);
        }
        
        setPendingChanges({});
    };

    const handleClearChanges = () => {
        setPendingChanges({});
    };

    const handleDownloadTemplate = () => {
        const headers = ['sku', 'product_name', 'current_cost_price', 'new_cost_price', 'current_selling_price', 'new_selling_price'];
        const data = products.map(p => [
            p.sku,
            p.name,
            p.costPrice,
            '', // Placeholder for new cost price
            p.price,
            ''  // Placeholder for new selling price
        ]);
        downloadCSV('update_prices_template.csv', headers, data);
    };

    const handleApplyPercentage = () => {
        const percentage = parseFloat(percentUpdate);
        if (isNaN(percentage) || percentage < 0) {
            return;
        }

        const newChanges = { ...pendingChanges };

        filteredProducts.forEach(product => {
            const currentPrice = pendingChanges[product.id]?.[priceFieldToUpdate] ?? product[priceFieldToUpdate];
            let newPrice;

            if (percentType === 'increase') {
                newPrice = currentPrice * (1 + percentage / 100);
            } else { // decrease
                newPrice = currentPrice * (1 - percentage / 100);
            }
            
            // Round to 2 decimal places to avoid floating point issues
            newPrice = Math.round(newPrice * 100) / 100;

            newChanges[product.id] = {
                ...newChanges[product.id],
                [priceFieldToUpdate]: newPrice
            };
        });

        setPendingChanges(newChanges);
    };

    if (!canUpdatePrice) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to update product prices.
                </p>
            </div>
        );
    }
    
    const selectClasses = "w-full pl-4 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const inputClasses = "w-full px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const changedInputClasses = "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-600";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Update Product Prices</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Bulk edit cost and selling prices for your products.</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={handleDownloadTemplate} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold whitespace-nowrap">
                            Download Template
                        </button>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input 
                        type="text" 
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                     <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClasses} aria-label="Filter by category">
                        <option value="all">All Categories</option>
                        {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className={selectClasses} aria-label="Filter by brand">
                        <option value="all">All Brands</option>
                        {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                    </select>
                </div>
                 <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Bulk Update by Percentage</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Apply a percentage change to all currently filtered products.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="percentUpdate" className="block text-sm font-medium">Percentage (%)</label>
                            <input
                                type="number"
                                id="percentUpdate"
                                value={percentUpdate}
                                onChange={e => setPercentUpdate(e.target.value)}
                                placeholder="e.g., 10"
                                className={`${inputClasses} mt-1`}
                            />
                        </div>
                         <div>
                            <label htmlFor="priceFieldToUpdate" className="block text-sm font-medium">Apply to</label>
                            <select
                                id="priceFieldToUpdate"
                                value={priceFieldToUpdate}
                                onChange={e => setPriceFieldToUpdate(e.target.value as any)}
                                className={`${selectClasses} mt-1`}
                            >
                                <option value="price">Selling Price</option>
                                <option value="costPrice">Cost Price</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="percentType" className="block text-sm font-medium">Action</label>
                            <select
                                id="percentType"
                                value={percentType}
                                onChange={e => setPercentType(e.target.value as any)}
                                className={`${selectClasses} mt-1`}
                            >
                                <option value="increase">Increase</option>
                                <option value="decrease">Decrease</option>
                            </select>
                        </div>
                        <button
                            onClick={handleApplyPercentage}
                            disabled={!percentUpdate || parseFloat(percentUpdate) <= 0 || filteredProducts.length === 0}
                            className="w-full px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply to Filtered ({filteredProducts.length})
                        </button>
                    </div>
                </div>
                 <div className="mt-4 flex justify-end items-center gap-2">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {Object.keys(pendingChanges).length} Unsaved Changes
                    </div>
                    <button onClick={handleClearChanges} disabled={!hasUnsavedChanges} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                        Clear
                    </button>
                    <button onClick={handleSaveChanges} disabled={!hasUnsavedChanges} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        Save All Changes
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Product</th>
                            <th scope="col" className="px-6 py-3 text-right">Current Cost</th>
                            <th scope="col" className="px-6 py-3">New Cost</th>
                            <th scope="col" className="px-6 py-3 text-right">Current Selling Price</th>
                            <th scope="col" className="px-6 py-3">New Selling Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => {
                            const changedData = pendingChanges[product.id];
                            const newCost = changedData?.costPrice;
                            const newPrice = changedData?.price;
                            const isCostChanged = newCost !== undefined && newCost !== product.costPrice;
                            const isPriceChanged = newPrice !== undefined && newPrice !== product.price;

                            return (
                                <tr key={product.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                        {product.name}
                                        <span className="block text-xs font-normal text-slate-500">{product.sku}</span>
                                    </th>
                                    <td className="px-6 py-4 text-right font-mono">{product.costPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                    <td className="px-6 py-4 w-40">
                                        <input
                                            type="number"
                                            value={newCost !== undefined ? newCost : product.costPrice}
                                            onChange={(e) => handlePriceChange(product.id, 'costPrice', e.target.value)}
                                            className={`${inputClasses} ${isCostChanged ? changedInputClasses : ''}`}
                                            step="0.01"
                                            min="0"
                                            aria-label={`New cost price for ${product.name}`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                    <td className="px-6 py-4 w-40">
                                        <input
                                            type="number"
                                            value={newPrice !== undefined ? newPrice : product.price}
                                            onChange={(e) => handlePriceChange(product.id, 'price', e.target.value)}
                                            className={`${inputClasses} ${isPriceChanged ? changedInputClasses : ''}`}
                                            step="0.01"
                                            min="0"
                                            aria-label={`New selling price for ${product.name}`}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                         {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No products found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UpdatePricePage;
