import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';

interface ImportFromVendorModalProps {
    onClose: () => void;
    onAddProducts: (products: { productId: string, quantity: number, costPrice: number }[]) => void;
}

interface VendorProduct {
    id: string;
    name: string;
    sku: string;
    cost: number;
}

const MOCK_VENDOR_PRODUCTS: Record<string, VendorProduct[]> = {
    'SUP001': [ // Global Coffee Beans
        { id: 'GCB-E-01', name: 'Espresso', sku: 'SKU001', cost: 1.15 },
        { id: 'GCB-L-01', name: 'Latte', sku: 'SKU002', cost: 1.45 },
        { id: 'GCB-A-01', name: 'Americano', sku: 'SKU010', cost: 1.25 },
        { id: 'GCB-FR-01', name: 'French Roast Beans', sku: 'V-FRB-1KG', cost: 12.50 },
    ],
    'SUP002': [ // Premium Pastries Co.
        { id: 'PPC-C-01', name: 'Croissant', sku: 'SKU004', cost: 1.05 },
        { id: 'PPC-M-01', name: 'Muffin', sku: 'SKU005', cost: 0.85 },
        { id: 'PPC-D-01', name: 'Danish', sku: 'V-DANISH', cost: 1.10 },
    ],
    'default': [
        { id: 'V-PROD-1', name: 'Generic Vendor Item A', sku: 'V-A', cost: 10.00 },
        { id: 'V-PROD-2', name: 'Generic Vendor Item B', sku: 'V-B', cost: 25.50 },
    ]
};

const ImportFromVendorModal: React.FC<ImportFromVendorModalProps> = ({ onClose, onAddProducts }) => {
    const { integrations, products } = useAuth();
    const [selectedConnectionId, setSelectedConnectionId] = useState('');
    const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Record<string, { product: VendorProduct, quantity: number }>>({});

    const vendorConnections = useMemo(() => integrations.filter(i => i.provider === 'vendor-api'), [integrations]);
    const productsMap = useMemo(() => new Map(products.map(p => [p.sku.toLowerCase(), p])), [products]);

    const handleFetchProducts = () => {
        if (!selectedConnectionId) return;
        setIsLoading(true);
        setVendorProducts([]);
        setSelectedItems({});
        
        // Simulate an API call
        setTimeout(() => {
            const connection = vendorConnections.find(v => v.id === selectedConnectionId);
            const mockDataKey = connection?.name.includes('Coffee') ? 'SUP001' : connection?.name.includes('Pastries') ? 'SUP002' : 'default';
            setVendorProducts(MOCK_VENDOR_PRODUCTS[mockDataKey]);
            setIsLoading(false);
        }, 1000);
    };

    const handleItemSelectionChange = (item: VendorProduct, isSelected: boolean) => {
        setSelectedItems(prev => {
            const newSelection = { ...prev };
            if (isSelected) {
                newSelection[item.id] = { product: item, quantity: 10 }; // Default quantity
            } else {
                delete newSelection[item.id];
            }
            return newSelection;
        });
    };

    const handleQuantityChange = (itemId: string, quantityStr: string) => {
        const quantity = parseInt(quantityStr, 10);
        if (quantity > 0) {
            setSelectedItems(prev => ({
                ...prev,
                [itemId]: { ...prev[itemId], quantity }
            }));
        }
    };
    
    const handleAdd = () => {
        const productsToAdd = Object.values(selectedItems).map(({ product, quantity }) => {
            const matchedProduct = productsMap.get(product.sku.toLowerCase());
            return {
                productId: matchedProduct?.id,
                quantity,
                costPrice: product.cost,
            };
        }).filter(p => p.productId); // Only add products that exist in the POS

        onAddProducts(productsToAdd as { productId: string; quantity: number; costPrice: number }[]);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700">
                    <h3 className="text-xl font-bold">Import Products from Vendor API</h3>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium">1. Select Vendor Connection</label>
                        <div className="mt-1 flex gap-2">
                            <select value={selectedConnectionId} onChange={e => setSelectedConnectionId(e.target.value)} className="block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="" disabled>-- Select a connection --</option>
                                {vendorConnections.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                            <button onClick={handleFetchProducts} disabled={!selectedConnectionId || isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                                {isLoading ? 'Fetching...' : 'Fetch Products'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">2. Select Products to Add</label>
                        <div className="mt-1 border rounded-lg max-h-72 overflow-y-auto dark:border-slate-600">
                            {isLoading && <p className="text-center py-10 text-slate-500">Loading vendor products...</p>}
                            {!isLoading && vendorProducts.length === 0 && <p className="text-center py-10 text-slate-500">No products fetched. Select a vendor and click "Fetch Products".</p>}
                            {!isLoading && vendorProducts.length > 0 && (
                                <table className="w-full text-sm">
                                    <tbody>
                                        {vendorProducts.map(item => {
                                            const isSelected = !!selectedItems[item.id];
                                            const matchedProduct = productsMap.get(item.sku.toLowerCase());
                                            return (
                                                <tr key={item.id} className={`border-b dark:border-slate-700 ${!matchedProduct ? 'opacity-50' : ''}`}>
                                                    <td className="p-2 w-8"><input type="checkbox" checked={isSelected} onChange={e => handleItemSelectionChange(item, e.target.checked)} disabled={!matchedProduct} className="h-4 w-4 rounded text-indigo-600"/></td>
                                                    <td className="p-2 font-medium">{item.name} {!matchedProduct && <span className="text-xs text-yellow-500">(Not in POS)</span>}</td>
                                                    <td className="p-2 text-slate-500">{item.sku}</td>
                                                    <td className="p-2 text-right">{item.cost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                                    <td className="p-2 w-24">
                                                        {isSelected && <input type="number" value={selectedItems[item.id].quantity} onChange={e => handleQuantityChange(item.id, e.target.value)} className="w-full text-center rounded-md bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-indigo-500"/>}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleAdd} disabled={Object.keys(selectedItems).length === 0} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400">Add to Purchase</button>
                </div>
            </div>
        </div>
    );
};

export default ImportFromVendorModal;
