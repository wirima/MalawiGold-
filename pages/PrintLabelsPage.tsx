
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';

interface PrintQueueItem {
    product: Product;
    quantity: number;
}

const PrintLabelsPage: React.FC = () => {
    const { products, hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [printQueue, setPrintQueue] = useState<PrintQueueItem[]>([]);
    const printAreaRef = useRef<HTMLDivElement>(null);

    if (!hasPermission('products:print_labels')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to print labels.
                </p>
            </div>
        );
    }
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10); // Limit results for performance
    }, [products, searchTerm]);

    const addToPrintQueue = (product: Product) => {
        if (!printQueue.some(item => item.product.id === product.id)) {
            setPrintQueue(prev => [...prev, { product, quantity: 10 }]); // Default quantity
        }
        setSearchTerm('');
    };

    const updateQuantity = (productId: string, quantity: number) => {
        const newQuantity = Math.max(0, quantity);
        setPrintQueue(prev => prev.map(item => 
            item.product.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromPrintQueue = (productId: string) => {
        setPrintQueue(prev => prev.filter(item => item.product.id !== productId));
    };

    const handlePrint = () => {
        window.print();
    };

    // Effect to render barcodes
    useEffect(() => {
        const renderBarcodes = () => {
             printQueue.forEach(({ product, quantity }) => {
                for (let i = 0; i < quantity; i++) {
                    const elementId = `#barcode-${product.id}-${i}`;
                    const printElementId = `#print-barcode-${product.id}-${i}`;
                    
                    const previewElement = document.querySelector(elementId);
                    const printElement = document.querySelector(printElementId);

                    const options = {
                        format: product.barcodeType,
                        displayValue: true,
                        fontSize: 14,
                        margin: 10,
                        height: 50,
                    };
                    
                    try {
                        // @ts-ignore JsBarcode is from a CDN
                        if (previewElement) JsBarcode(previewElement, product.sku, options);
                        // @ts-ignore
                        if (printElement) JsBarcode(printElement, product.sku, { ...options, fontSize: 10, height: 40 });
                    } catch (e) {
                        console.error(`Failed to generate barcode for SKU ${product.sku} with format ${product.barcodeType}. Error: ${e}`);
                        // Optionally display an error on the barcode SVG itself
                    }
                }
            });
        };
       
       renderBarcodes();

    }, [printQueue]);

    return (
        <>
            <div className="print:hidden space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h1 className="text-2xl font-bold">Print Product Labels</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Search for products, add them to the queue, and print.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Search and Add Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">1. Add Products to Print Queue</h2>
                            <div className="relative">
                                <label htmlFor="product-search" className="sr-only">Search Products</label>
                                <input
                                    id="product-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search by product name or SKU..."
                                    className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {filteredProducts.length > 0 && (
                                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 max-h-60 overflow-auto">
                                        {filteredProducts.map(product => (
                                            <li key={product.id}>
                                                <button
                                                    onClick={() => addToPrintQueue(product)}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                >
                                                    {product.name} <span className="text-xs text-slate-500">({product.sku})</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Print Queue Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">2. Set Quantities</h2>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {printQueue.length === 0 && <p className="text-slate-500 text-center py-4">No products added yet.</p>}
                                {printQueue.map(({ product, quantity }) => (
                                    <div key={product.id} className="flex items-center gap-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{product.name}</p>
                                            <p className="text-xs text-slate-500">{product.sku}</p>
                                        </div>
                                        <div>
                                            <label htmlFor={`quantity-${product.id}`} className="sr-only">Quantity</label>
                                            <input
                                                id={`quantity-${product.id}`}
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={e => updateQuantity(product.id, parseInt(e.target.value, 10) || 0)}
                                                className="w-20 pl-2 pr-1 py-1 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <button onClick={() => removeFromPrintQueue(product.id)} className="text-slate-400 hover:text-red-500 p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold">3. Preview & Print</h2>
                        <div className="mt-4 p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 min-h-[10rem] max-h-96 overflow-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {printQueue.map(({ product, quantity }) =>
                                    Array.from({ length: quantity }).map((_, i) => (
                                        <div key={`${product.id}-${i}`} className="p-2 border dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md text-center text-xs">
                                            <p className="font-bold truncate">{product.name}</p>
                                            <p className="text-slate-600 dark:text-slate-400">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                            <svg id={`barcode-${product.id}-${i}`}></svg>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                         <div className="mt-4 flex justify-end">
                            <button
                                onClick={handlePrint}
                                disabled={printQueue.length === 0}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                                Print Labels
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Only Area */}
            <div ref={printAreaRef} className="hidden print:block">
                <style>{`
                    @media print {
                        @page {
                            size: auto;
                            margin: 0.25in;
                        }
                        body {
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                `}</style>
                <div className="grid grid-cols-4 gap-2">
                     {printQueue.flatMap(({ product, quantity }) =>
                        Array.from({ length: quantity }).map((_, i) => (
                            <div key={`print-${product.id}-${i}`} className="p-1 border border-black text-center text-[8px] break-words">
                                <p className="font-bold truncate">{product.name}</p>
                                <p>{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                <svg id={`print-barcode-${product.id}-${i}`}></svg>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default PrintLabelsPage;
