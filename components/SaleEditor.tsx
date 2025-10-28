

import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product, CartItem, Customer } from '../types';

interface SaleEditorProps {
    onSave: (cart: CartItem[], customer: Customer, total: number, passportNumber?: string, nationality?: string) => void;
    pageTitle: string;
    saveButtonText: string;
    initialCart?: CartItem[];
    initialCustomerId?: string;
}

const SaleEditor: React.FC<SaleEditorProps> = ({ 
    onSave, 
    pageTitle, 
    saveButtonText, 
    initialCart = [], 
    initialCustomerId 
}) => {
    const { products, customers } = useAuth();
    
    const [cart, setCart] = useState<CartItem[]>(initialCart);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
        initialCustomerId || customers.find(c => c.name === 'Walk-in Customer')?.id || customers[0]?.id || ''
    );
    const [cartErrors, setCartErrors] = useState<Record<string, string>>({});
    const [passportNumber, setPassportNumber] = useState('');
    const [nationality, setNationality] = useState('');

    const addToCart = useCallback((product: Product) => {
        if (product.stock <= 0) return;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            const newCartErrors = { ...cartErrors };
            delete newCartErrors[product.id];

            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                     newCartErrors[product.id] = `Max stock: ${product.stock}`;
                     setCartErrors(newCartErrors);
                     return prevCart;
                }
                setCartErrors(newCartErrors);
                return prevCart.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            setCartErrors(newCartErrors);
            return [...prevCart, { ...product, quantity: 1 }];
        });
    }, [cartErrors]);

    const updateQuantity = useCallback((productId: string, newQuantity: number) => {
        setCart(prevCart => {
            const itemToUpdate = prevCart.find(item => item.id === productId);
            if (!itemToUpdate) return prevCart;
            
            const newCartErrors = { ...cartErrors };
            delete newCartErrors[productId];

            if (isNaN(newQuantity) || newQuantity <= 0) {
                setCartErrors(newCartErrors);
                return prevCart.filter(item => item.id !== productId);
            }

            if (newQuantity > itemToUpdate.stock) {
                newCartErrors[productId] = `Max: ${itemToUpdate.stock}`;
                setCartErrors(newCartErrors);
                return prevCart.map(item => 
                    item.id === productId ? { ...item, quantity: itemToUpdate.stock } : item
                );
            }
            
            setCartErrors(newCartErrors);
            return prevCart.map(item => 
                item.id === productId ? { ...item, quantity: newQuantity } : item
            );
        });
    }, [cartErrors]);
    
    const removeItem = useCallback((productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
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

    const handleSave = () => {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) {
            alert('Please select a valid customer.');
            return;
        }
        onSave(cart, customer, total, passportNumber, nationality);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-10rem)] gap-6">
            {/* Products Grid */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                     <input 
                        type="text" 
                        placeholder="Search products by name or SKU..."
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
                                <p className="text-xs text-indigo-500">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart/Order */}
            <div className="w-full lg:w-[28rem] bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">{pageTitle}</h2>
                </div>
                 <div className="p-4 space-y-4">
                    <div>
                        <label htmlFor="customer" className="block text-sm font-medium">Customer</label>
                        <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500">
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="passportNumber" className="block text-sm font-medium">Passport Number</label>
                            <input type="text" id="passportNumber" value={passportNumber} onChange={e => setPassportNumber(e.target.value)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="nationality" className="block text-sm font-medium">Nationality</label>
                            <input type="text" id="nationality" value={nationality} onChange={e => setNationality(e.target.value)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto border-t dark:border-slate-700">
                    {cart.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 mt-8">Your cart is empty.</p>
                    ) : (
                        <ul className="space-y-4">
                            {cart.map(item => (
                                <li key={item.id} className="flex items-start space-x-3">
                                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0"/>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate" title={item.name}>{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    </div>
                                    <div className="flex-shrink-0 w-28 text-right">
                                        <div className="flex items-center border dark:border-slate-600 rounded-md w-full justify-between">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-lg font-bold">-</button>
                                            <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} className={`w-10 text-center bg-transparent focus:outline-none ${cartErrors[item.id] ? 'text-red-500' : ''}`} />
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-lg font-bold">+</button>
                                        </div>
                                        {cartErrors[item.id] && <p className="text-xs text-red-500 text-center mt-1">{cartErrors[item.id]}</p>}
                                    </div>
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
                    <button onClick={handleSave} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-indigo-400" disabled={cart.length === 0}>
                        {saveButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleEditor;