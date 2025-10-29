import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';

interface PrintQueueItem {
    product: Product;
    quantity: number;
}

const LABEL_SHEET_OPTIONS = [
    { id: '80-per-sheet', name: '80 per Sheet (Avery 5167)', columns: 4, capacity: 80 },
    { id: '30-per-sheet', name: '30 per Sheet (Avery 5160)', columns: 3, capacity: 30 },
    { id: '24-per-sheet', name: '24 per Sheet (Avery 5195)', columns: 3, capacity: 24 },
    { id: '20-per-sheet', name: '20 per Sheet (Avery 5161)', columns: 2, capacity: 20 },
    { id: '14-per-sheet', name: '14 per Sheet (Avery 5162)', columns: 2, capacity: 14 },
    { id: '10-per-sheet', name: '10 per Sheet (Avery 5163)', columns: 2, capacity: 10 },
];

const PrintLabelsPage: React.FC = () => {
    const { products, hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [printQueue, setPrintQueue] = useState<PrintQueueItem[]>([]);
    const [labelSize, setLabelSize] = useState(LABEL_SHEET_OPTIONS[1].id); // Default to 30
    const [fillSheet, setFillSheet] = useState(false);

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
        ).slice(0, 10);
    }, [products, searchTerm]);

    const addToPrintQueue = (product: Product) => {
        if (!printQueue.some(item => item.product.id === product.id)) {
            setPrintQueue(prev => [...prev, { product, quantity: 10 }]);
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
    
    const labelsToRender = useMemo(() => {
        const baseLabels = printQueue.flatMap(({ product, quantity }) =>
            Array.from({ length: quantity }, (_, i) => ({ product, index: i }))
        );

        if (fillSheet) {
            const selectedSheet = LABEL_SHEET_OPTIONS.find(opt => opt.id === labelSize);
            const capacity = selectedSheet?.capacity || 30;
            if (baseLabels.length === 0) return [];
            
            return Array.from({ length: capacity }, (_, i) => baseLabels[i % baseLabels.length]);
        }

        return baseLabels;
    }, [printQueue, fillSheet, labelSize]);

    const handlePrint = () => {
        const selectedSheet = LABEL_SHEET_OPTIONS.find(opt => opt.id === labelSize);
        if (!selectedSheet) return;

        const allLabels = printQueue.flatMap(({ product, quantity }) =>
            Array.from({ length: quantity }, (_, i) => ({ product, index: i }))
        );

        if (allLabels.length === 0) return;

        const labelsForPrinting = fillSheet
            ? Array.from({ length: selectedSheet.capacity }, (_, i) => allLabels[i % allLabels.length])
            : allLabels;
    
        let printContent = '';
        labelsForPrinting.forEach(({ product }, arrayIndex) => {
            const safeName = product.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const uniqueId = `${product.id}-${arrayIndex}`;
            printContent += `
                <div class="label-container">
                    <p class="label-name">${safeName}</p>
                    <p class="label-price">${product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    <svg id="print-barcode-${uniqueId}"></svg>
                </div>
            `;
        });
    
        const html = `
            <html>
                <head>
                    <title>Print Labels</title>
                    <style>
                        @media print {
                            @page { size: letter; margin: 0.5in; }
                            body { margin: 0; }
                        }
                        body { font-family: sans-serif; }
                        .label-grid {
                            display: grid;
                            grid-template-columns: repeat(${selectedSheet.columns}, 1fr);
                            gap: 4px;
                            page-break-before: always;
                        }
                        .label-container {
                            border: 1px solid #ccc;
                            padding: 4px;
                            text-align: center;
                            font-size: 8px;
                            break-inside: avoid;
                            overflow: hidden;
                        }
                        .label-name { font-weight: bold; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                        .label-price { margin: 0 0 2px 0; }
                        svg { display: block; margin: 0 auto; width: 100%; max-width: 150px; height: auto; }
                    </style>
                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
                </head>
                <body>
                    <div class="label-grid">${printContent}</div>
                    <script>
                        document.addEventListener('DOMContentLoaded', () => {
                            ${
                                labelsForPrinting.map(({ product }, arrayIndex) => {
                                    const uniqueId = `${product.id}-${arrayIndex}`;
                                    return `
                                        try {
                                            JsBarcode("#print-barcode-${uniqueId}", "${product.sku}", {
                                                format: "${product.barcodeType}",
                                                displayValue: true,
                                                fontSize: 10,
                                                margin: 2,
                                                height: 30,
                                                width: 1.5,
                                            });
                                        } catch(e) { console.error(e); }
                                    `
                                }).join('')
                            }
                            
                            setTimeout(() => {
                                window.print();
                                window.onafterprint = () => window.close();
                            }, 250);
                        });
                    <\/script>
                </body>
            </html>
        `;
    
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    useEffect(() => {
        labelsToRender.forEach(({ product }, arrayIndex) => {
            const elementId = `#barcode-preview-${product.id}-${arrayIndex}`;
            const previewElement = document.querySelector(elementId);
            if (previewElement) {
                // Clear previous barcode before re-rendering
                while (previewElement.firstChild) {
                    previewElement.removeChild(previewElement.firstChild);
                }
                try {
                    // @ts-ignore
                    JsBarcode(previewElement, product.sku, {
                        format: product.barcodeType,
                        displayValue: true,
                        fontSize: 14,
                        margin: 10,
                        height: 50,
                    });
                } catch (e) {
                    console.error(`Failed to generate preview barcode for SKU ${product.sku}. Error: ${e}`);
                }
            }
        });
    }, [labelsToRender]);


    const previewGridCols = LABEL_SHEET_OPTIONS.find(opt => opt.id === labelSize)?.columns || 3;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold">Print Product Labels</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Search for products, add them to the queue, and print.</p>
                </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">1. Add Products to Print Queue</h2>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by product name or SKU..."
                                className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border focus:ring-2 focus:ring-indigo-500"
                            />
                            {filteredProducts.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 max-h-60 overflow-auto">
                                    {filteredProducts.map(product => (
                                        <li key={product.id}>
                                            <button onClick={() => addToPrintQueue(product)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                                                {product.name} <span className="text-xs text-slate-500">({product.sku})</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">2. Set Quantities</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {printQueue.length === 0 && <p className="text-slate-500 text-center py-4">No products added yet.</p>}
                            {printQueue.map(({ product, quantity }) => (
                                <div key={product.id} className="flex items-center gap-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.sku}</p>
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={e => updateQuantity(product.id, parseInt(e.target.value, 10) || 0)}
                                            className="w-20 pl-2 pr-1 py-1 rounded-md bg-slate-100 dark:bg-slate-700 border focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <button onClick={() => removeFromPrintQueue(product.id)} className="text-slate-400 hover:text-red-500 p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">3. Preview & Print</h2>
                     <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:items-end">
                        <div className="flex-1">
                            <label htmlFor="label-size" className="block text-sm font-medium">Label Size</label>
                            <select
                                id="label-size"
                                value={labelSize}
                                onChange={e => setLabelSize(e.target.value)}
                                className="mt-1 max-w-xs w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-slate-100 dark:bg-slate-700"
                            >
                                {LABEL_SHEET_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </select>
                        </div>
                         <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="fill-sheet"
                                    name="fill-sheet"
                                    type="checkbox"
                                    checked={fillSheet}
                                    onChange={(e) => setFillSheet(e.target.checked)}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="fill-sheet" className="font-medium text-gray-700 dark:text-gray-300">Fill entire sheet</label>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 min-h-[10rem] max-h-96 overflow-auto">
                        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${previewGridCols}, 1fr)`}}>
                            {labelsToRender.map(({ product }, arrayIndex) =>
                                <div key={arrayIndex} className="p-2 border dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md text-center text-xs break-words">
                                    <p className="font-bold truncate">{product.name}</p>
                                    <p className="text-slate-600 dark:text-slate-400">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    <svg id={`barcode-preview-${product.id}-${arrayIndex}`}></svg>
                                </div>
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
    );
};

export default PrintLabelsPage;
