import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product, CartItem, Supplier } from '../types';

interface PurchaseEditorProps {
    onSave: (cart: CartItem[], supplier: Supplier, total: number) => void;
    pageTitle: string;
    saveButtonText: string;
    mode: 'purchase' | 'return';
}

const PurchaseEditor: React.FC<PurchaseEditorProps> = ({ 
    onSave, 
    pageTitle, 
    saveButtonText,
    mode
}) => {
    const { products, suppliers } = useAuth();
    
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
    const [cartErrors, setCartErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    
    const addToCart = useCallback((product: Product) => {
        if (mode === 'return' && product.stock <= 0) return;
        setFormError(null);
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            const newCartErrors = { ...cartErrors };
            delete newCartErrors[product.id];

            if (existingItem) {
                if (mode === 'return' && existingItem.quantity >= product.stock) {
                    newCartErrors[product.id] = `Max: ${product.stock}`;
                    setCartErrors(newCartErrors);
                    return prevCart;
                }
                setCartErrors(newCartErrors);
                return prevCart.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // When adding, the purchase price defaults to the current selling price
            setCartErrors(newCartErrors);
            return [...prevCart, { ...product, quantity: 1 }];
        });
    }, [cartErrors, mode]);

    const updateCartItem = useCallback((productId: string, field: 'quantity' | 'price', value: number) => {
        if (isNaN(value)) return;

        setCart(prevCart => {
            const itemToUpdate = prevCart.find(item => item.id === productId);
            if (!itemToUpdate) return prevCart;

            const newCartErrors = { ...cartErrors };
            delete newCartErrors[productId];
            
            let newCart = [...prevCart];

            if (field === 'quantity') {
                if (value <= 0) {
                    setCartErrors(newCartErrors);
                    return prevCart.filter(item => item.id !== productId);
                }
                if (mode === 'return' && value > itemToUpdate.stock) {
                    newCartErrors[productId] = `Max: ${itemToUpdate.stock}`;
                    value = itemToUpdate.stock;
                }
            }

            newCart = prevCart.map(item => {
                if (item.id === productId) {
                    return { ...item, [field]: value };
                }
                return item;
            });
            
            setCartErrors(newCartErrors);
            return newCart;
        });
    }, [cartErrors, mode]);
    
    const removeItem = useCallback((productId: string) => {
        setFormError(null);
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const filteredProducts = useMemo(() => products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleSave = () => {
        const supplier = suppliers.find(s => s.id === selectedSupplierId);
        if (!supplier) {
            setFormError('Please select a valid supplier.');
            return;
        }
        if (cart.length === 0) {
            setFormError(`Cannot save an empty ${mode}. Please add products.`);
            return;
        }
        setFormError(null);
        onSave(cart, supplier, total);
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
                            <div key={product.id} onClick={() => addToCart(product)} className="relative cursor-pointer border dark:border-slate-700 rounded-lg p-2 text-center group transition-all hover:shadow-lg hover:border-indigo-500 hover:scale-105">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2"/>
                                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{product.name}</h3>
                                <p className="text-xs text-indigo-500">Stock: {product.stock}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart/Order */}
            <div className="w-full lg:w-[32rem] bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">{pageTitle}</h2>
                </div>
                 <div className="p-4">
                    <label htmlFor="supplier" className="block text-sm font-medium">Supplier</label>
                     <select id="supplier" value={selectedSupplierId} onChange={e => { setSelectedSupplierId(e.target.value); setFormError(null); }} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500">
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>)}
                    </select>
                </div>
                <div className="flex-1 p-4 overflow-y-auto border-t dark:border-slate-700">
                    {cart.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 mt-8">Your purchase order is empty.</p>
                    ) : (
                        <ul className="space-y-4">
                            {cart.map(item => (
                                <li key={item.id} className="grid grid-cols-12 gap-2 items-start">
                                    <div className="col-span-2">
                                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover"/>
                                    </div>
                                    <div className="col-span-10 flex flex-col">
                                        <p className="font-semibold text-sm truncate" title={item.name}>{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs">
                                            <div className="flex-1">
                                                <label htmlFor={`price-${item.id}`} className="sr-only">Price</label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-500">$</span>
                                                     <input type="number" id={`price-${item.id}`} value={item.price} onChange={e => updateCartItem(item.id, 'price', parseFloat(e.target.value))} className="w-full pl-6 pr-1 py-1 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                                </div>
                                            </div>
                                            <span className="text-slate-400">×</span>
                                            <div className="flex-1">
                                                 <label htmlFor={`qty-${item.id}`} className="sr-only">Quantity</label>
                                                <input type="number" id={`qty-${item.id}`} value={item.quantity} onChange={e => updateCartItem(item.id, 'quantity', parseInt(e.target.value))} className={`w-full px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${cartErrors[item.id] ? 'border-red-500 dark:border-red-500' : ''}`} />
                                            </div>
                                            <button onClick={() => removeItem(item.id)} title="Remove item" className="text-slate-400 hover:text-red-500 p-1 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                         {cartErrors[item.id] && <p className="text-xs text-red-500 mt-1">{cartErrors[item.id]}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                    {formError && <p className="text-sm text-red-500 text-center -mb-1">{formError}</p>}
                    <button onClick={handleSave} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-indigo-400" disabled={cart.length === 0}>
                        {saveButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseEditor;