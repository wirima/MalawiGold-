import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';

const AgeVerificationSettingsPage: React.FC = () => {
    const { products, categories, ageVerificationSettings, updateAgeVerificationSettings, hasPermission } = useAuth();

    const [localAge, setLocalAge] = useState(ageVerificationSettings.minimumAge);
    const [restrictedIds, setRestrictedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setLocalAge(ageVerificationSettings.minimumAge);
        setRestrictedIds(new Set(products.filter(p => p.isAgeRestricted).map(p => p.id)));
    }, [ageVerificationSettings, products]);

    const canManage = hasPermission('settings:age_verification');

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === 'all' || p.categoryId === categoryFilter)
        );
    }, [products, searchTerm, categoryFilter]);

    const handleToggleProduct = (productId: string) => {
        setRestrictedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };
    
    const handleSelectAllFiltered = () => {
        setRestrictedIds(prev => {
            const newSet = new Set(prev);
            filteredProducts.forEach(p => newSet.add(p.id));
            return newSet;
        });
    };

    const handleDeselectAllFiltered = () => {
        setRestrictedIds(prev => {
            const newSet = new Set(prev);
            filteredProducts.forEach(p => newSet.delete(p.id));
            return newSet;
        });
    };


    const handleSave = () => {
        updateAgeVerificationSettings(localAge, Array.from(restrictedIds));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (!canManage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage these settings.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">Age Verification Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Set the minimum age and select which products require age verification at the POS.
                </p>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="minimum-age" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Minimum Legal Age
                    </label>
                    <input
                        type="number"
                        id="minimum-age"
                        value={localAge}
                        onChange={e => setLocalAge(parseInt(e.target.value, 10) || 18)}
                        min="1"
                        className="mt-1 block w-full max-w-xs rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Restricted Products</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select all products that should trigger an age check.</p>
                     <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <button onClick={handleSelectAllFiltered} className="px-3 py-1 text-sm rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">
                            Select All Filtered ({filteredProducts.length})
                        </button>
                         <button onClick={handleDeselectAllFiltered} className="px-3 py-1 text-sm rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">
                            Deselect All Filtered
                        </button>
                    </div>
                     <div className="mt-4 border rounded-lg dark:border-slate-700 max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">Product</th>
                                    <th className="px-6 py-3 text-center font-medium">Requires Verification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-3">
                                            <span className="font-semibold">{product.name}</span>
                                            <span className="text-slate-500 ml-2">({product.sku})</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={restrictedIds.has(product.id)}
                                                onChange={() => handleToggleProduct(product.id)}
                                                className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end items-center gap-4">
                {showSuccess && <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully!</p>}
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default AgeVerificationSettingsPage;
