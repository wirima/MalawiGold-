import React, { useEffect, useMemo } from 'react';
import { Sale } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SaleReceiptProps {
    sale: Sale;
    onClose: () => void;
}

const SaleReceipt: React.FC<SaleReceiptProps> = ({ sale, onClose }) => {
    const { paymentMethods, brandingSettings } = useAuth();
    const paymentMethodsMap = useMemo(() => new Map(paymentMethods.map(p => [p.id, p.name])), [paymentMethods]);

    useEffect(() => {
        // @ts-ignore
        if (window.JsBarcode) {
            try {
                 // @ts-ignore
                JsBarcode("#barcode", sale.id, {
                    format: "CODE128",
                    displayValue: true,
                    fontSize: 18,
                    height: 50,
                    margin: 10,
                });
            } catch(e) {
                console.error("Error generating barcode:", e);
            }
        }
    }, [sale.id]);
    
    const handlePrint = () => {
        window.print();
    };

    const subtotal = sale.items.reduce((acc, item) => {
        const price = item.originalPrice ?? item.price;
        return acc + price * item.quantity;
    }, 0);

    let discountAmount = 0;
    if (sale.discount) {
        if (sale.discount.type === 'percentage') {
            discountAmount = (subtotal * sale.discount.value) / 100;
        } else {
            discountAmount = sale.discount.value;
        }
    }
    
    const totalWithDiscount = subtotal - discountAmount;
    const tax = totalWithDiscount * 0.08; // Assuming tax is calculated after discount
    const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
    const changeDue = totalPaid - sale.total;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
            <style>
                {`
                    @media print {
                        body > *:not(#receipt-modal-wrapper) {
                            display: none;
                        }
                        #receipt-modal-wrapper, #receipt-modal {
                            display: block;
                            position: static;
                            width: 100%;
                            height: auto;
                            box-shadow: none;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                `}
            </style>
            <div id="receipt-modal-wrapper" className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm flex flex-col font-mono">
                {sale.status === 'voided' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-8xl font-black text-red-500/20 dark:text-red-500/10 transform -rotate-45">VOID</span>
                    </div>
                )}
                 {sale.isQueued && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-5xl font-black text-yellow-500/20 dark:text-yellow-500/10 transform -rotate-45">PENDING SYNC</span>
                    </div>
                )}
                <div id="print-section" className="p-6 overflow-y-auto text-slate-800 dark:text-slate-200">
                    <div className="text-center">
                        {brandingSettings.logoUrl && (
                            <img src={brandingSettings.logoUrl} alt={brandingSettings.businessName} className="mx-auto h-16 object-contain mb-2" />
                        )}
                        <h2 className="text-2xl font-bold">{brandingSettings.businessName}</h2>
                        <p className="text-xs text-slate-500">{brandingSettings.address}</p>
                        <p className="text-xs text-slate-500">{brandingSettings.phone}</p>
                        <p className="text-sm text-slate-500 mt-2">{sale.status === 'return' ? 'Return Receipt' : 'Sale Receipt'}</p>
                    </div>
                    <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
                        <p><span className="font-bold">Date:</span> {new Date(sale.date).toLocaleString()}</p>
                        <p><span className="font-bold">Customer:</span> {sale.customer.name}</p>
                        <p><span className="font-bold">Sale ID:</span> {sale.id}</p>
                    </div>
                    <div className="mt-4 border-t-2 border-b-2 border-dashed py-2 text-xs">
                        {sale.items.map(item => (
                            <div key={item.id} className="mb-2 last:mb-0">
                                <div className="flex justify-between">
                                    <span className="font-bold flex-1 break-words pr-2">{item.name}</span>
                                    <span className="font-bold text-right">{(item.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 dark:text-slate-400 pl-2">
                                    <span>{item.quantity} x {item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                    {item.originalPrice && (
                                        <span className="text-orange-500">
                                            (Orig. {item.originalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-xs">
                         <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                        </div>
                        {sale.discount && (
                             <div className="flex justify-between">
                                <span>Discount ({sale.discount.type === 'percentage' ? `${sale.discount.value}%` : 'fixed'}):</span>
                                <span>- {discountAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Tax (8%):</span>
                            <span>{tax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm mt-1 border-t-2 border-dashed pt-1">
                            <span>Total Due:</span>
                            <span>{sale.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                        </div>
                    </div>
                     <div className="mt-4 text-xs border-t-2 border-dashed pt-2">
                        <p className="font-bold mb-1">Payments:</p>
                        {sale.payments.map((p, i) => (
                            <div key={i} className="flex justify-between">
                                <span>{paymentMethodsMap.get(p.methodId) || 'Unknown'}:</span>
                                <span>{p.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </div>
                        ))}
                         {changeDue > 0.005 && (
                            <div className="flex justify-between font-bold mt-1">
                                <span>Change Due:</span>
                                <span>{changeDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 text-center">
                        <svg id="barcode"></svg>
                        <p className="text-xs mt-2">Thank you for your business!</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-3 rounded-b-lg no-print">
                    <button onClick={handlePrint} className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        Print
                    </button>
                    <button onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleReceipt;