import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product, CartItem, Customer, PaymentMethod } from '../types';

const PaymentModal: React.FC<{
    total: number;
    onClose: () => void;
    onConfirm: (paymentMethodId: string) => void;
    paymentMethods: PaymentMethod[];
}> = ({ total, onClose, onConfirm, paymentMethods }) => {
    const [selectedMethodId, setSelectedMethodId] = useState<string>(paymentMethods[0]?.id || '');
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Confirm Payment</h3>
                    <p className="mt-2 text-center text-5xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    <div className="mt-6">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethodId(method.id)}
                                    className={`px-3 py-3 rounded-lg text-sm font-semibold border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 ${
                                        selectedMethodId === method.id 
                                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                                        : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                                    }`}
                                >
                                    {method.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                        Cancel
                    </button>
                    <button type="button" onClick={() => onConfirm(selectedMethodId)} disabled={!selectedMethodId} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed">
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

const POSPage: React.FC = () => {
    const { products, customers, addSale, hasPermission, paymentMethods } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers.find(c => c.name === 'Walk-in Customer')?.id || customers[0]?.id || '');
    const [cartErrors, setCartErrors] = useState<Record<string, string>>({});
    const [passportNumber, setPassportNumber] = useState('');
    const [nationality, setNationality] = useState('');


    if (!hasPermission('sell:pos')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to access the POS.
                </p>
            </div>
        );
    }

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const addToCart = useCallback((product: Product) => {
        const liveProduct = productsMap.get(product.id);
        if (!liveProduct || liveProduct.stock <= 0) return;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            const newCartErrors = { ...cartErrors };
            delete newCartErrors[product.id];

            if (existingItem) {
                if (existingItem.quantity >= liveProduct.stock) {
                    newCartErrors[product.id] = `Max: ${liveProduct.stock}`;
                    setCartErrors(newCartErrors);
                    return prevCart;
                }
                setCartErrors(newCartErrors);
                return prevCart.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            setCartErrors(newCartErrors);
            return [...prevCart, { ...liveProduct, quantity: 1 }];
        });
    }, [productsMap, cartErrors]);

    const updateQuantity = useCallback((productId: string, newQuantity: number) => {
        setCart(prevCart => {
            const liveProduct = productsMap.get(productId);
            if (!liveProduct) return prevCart;

            const newCartErrors = { ...cartErrors };
            delete newCartErrors[productId];

            if (isNaN(newQuantity) || newQuantity <= 0) {
                setCartErrors(newCartErrors);
                return prevCart.filter(item => item.id !== productId);
            }
            
            if (newQuantity > liveProduct.stock) {
                newCartErrors[productId] = `Max: ${liveProduct.stock}`;
                setCartErrors(newCartErrors);
                return prevCart.map(item =>
                    item.id === productId ? { ...item, quantity: liveProduct.stock } : item
                );
            }

            setCartErrors(newCartErrors);
            return prevCart.map(item => 
                item.id === productId ? { ...item, quantity: newQuantity } : item
            );
        });
    }, [productsMap, cartErrors]);
    
    const removeItem = useCallback((productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
        const newCartErrors = { ...cartErrors };
        delete newCartErrors[productId];
        setCartErrors(newCartErrors);
    }, [cartErrors]);

    const filteredProducts = useMemo(() => products.filter(product =>
        !product.isNotForSale &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [products, searchTerm]);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const handleConfirmPayment = (paymentMethodId: string) => {
        const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
        if (!selectedCustomer) {
            alert('Error: Please select a valid customer.');
            return;
        }

        addSale({
            customer: { id: selectedCustomer.id, name: selectedCustomer.name },
            items: cart,
            total,
            paymentMethodId,
            passportNumber,
            nationality
        });

        setIsPaymentModalOpen(false);
        setCart([]);
        setCartErrors({});
        setPassportNumber('');
        setNationality('');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    return (
        <div className="relative flex flex-col lg:flex-row h-[calc(100vh-10rem)] gap-6">
             {showSuccessMessage && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-lg font-semibold z-20">
                    Sale Completed Successfully!
                </div>
            )}
            {/* Products Grid */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                     <input 
                        type="text" 
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="p-4 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} onClick={() => addToCart(product)} className={`relative cursor-pointer border dark:border-slate-700 rounded-lg p-2 text-center group transition-all hover:shadow-lg hover:border-indigo-500 hover:scale-105 ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {product.stock <= 0 && <span className="absolute top-1 right-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full z-10">Out of Stock</span>}
                                 <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2"/>
                                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{product.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stock: {product.stock}</p>
                                <p className="text-xs font-semibold text-indigo-500">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart/Order */}
            <div className="w-full lg:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col">
                 <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Current Order ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h2>
                     <div className="mt-2 space-y-2">
                        <div>
                            <label htmlFor="pos-customer" className="sr-only">Customer</label>
                            <select 
                                id="pos-customer" 
                                value={selectedCustomerId} 
                                onChange={e => setSelectedCustomerId(e.target.value)}
                                className="block w-full text-sm rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="passportNumber" className="sr-only">Passport</label>
                                <input type="text" id="passportNumber" placeholder="Passport Number" value={passportNumber} onChange={e => setPassportNumber(e.target.value)} className="block w-full text-sm rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label htmlFor="nationality" className="sr-only">Nationality</label>
                                <input type="text" id="nationality" placeholder="Nationality" value={nationality} onChange={e => setNationality(e.target.value)} className="block w-full text-sm rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    {cart.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 mt-8">Your cart is empty.</p>
                    ) : (
                        <ul className="space-y-3">
                            {cart.map(item => (
                                <li key={item.id} className="flex items-center space-x-3">
                                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0"/>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate" title={item.name}>{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className={`flex items-center border rounded-md transition-colors ${cartErrors[item.id] ? 'border-red-500' : 'dark:border-slate-600'}`}>
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-l-md" aria-label="Decrease quantity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                                                className={`w-12 text-center bg-transparent focus:outline-none text-sm font-semibold ${cartErrors[item.id] ? 'text-red-500' : ''}`}
                                                aria-label="Item quantity"
                                            />
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-r-md" aria-label="Increase quantity">
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>
                                            </button>
                                        </div>
                                         {cartErrors[item.id] && <p className="text-xs text-red-500 text-center mt-1">{cartErrors[item.id]}</p>}
                                    </div>
                                    <p className="font-semibold w-16 text-right flex-shrink-0">{(item.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    <button onClick={() => removeItem(item.id)} title="Remove item" className="text-slate-400 hover:text-red-500 p-1 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="font-medium">{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Tax (8%)</span>
                        <span className="font-medium">{tax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                    <button onClick={() => setIsPaymentModalOpen(true)} className="w-full bg-green-500 text-white p-3 rounded-lg font-bold text-lg hover:bg-green-600 disabled:bg-green-300" disabled={cart.length === 0}>
                        Charge
                    </button>
                </div>
            </div>

            {isPaymentModalOpen && (
                <PaymentModal 
                    total={total}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handleConfirmPayment}
                    paymentMethods={paymentMethods}
                />
            )}
        </div>
    );
};

export default POSPage;