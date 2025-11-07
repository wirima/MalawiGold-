import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { Product, CartItem, Customer, Sale } from '../types';
import SaleReceipt from '../components/SaleReceipt';
import SplitPaymentModal from '../components/SplitPaymentModal';
import TrainingGuide from '../components/TrainingGuide';
import ResumeOrderModal from '../components/ResumeOrderModal';
import AgeVerificationModal from '../components/AgeVerificationModal';
import { useCurrency } from '../contexts/CurrencyContext';

interface HeldOrder {
    id: number;
    cart: CartItem[];
    customerId: string;
    customerName: string;
}

const DiscountModal: React.FC<{
    onClose: () => void;
    onApply: (type: 'percentage' | 'fixed', value: number) => void;
}> = ({ onClose, onApply }) => {
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState('');

    const handleApply = () => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            onApply(type, numValue);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xs" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold">Apply Discount</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Discount Type</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Value</label>
                        <input type="number" value={value} onChange={e => setValue(e.target.value)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent" />
                    </div>
                </div>
                 <div className="p-3 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleApply} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Apply</button>
                </div>
            </div>
        </div>
    );
};


const POSPage: React.FC = () => {
    const { products: allProducts, customers, addSale, hasPermission, ageVerificationSettings, currentUser, businessLocations, roles, addStockTransferRequest } = useAuth();
    const { isOnline, addSaleToQueue } = useOffline();
    const { formatCurrency } = useCurrency();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers.find(c => c.name === 'Walk-in Customer')?.id || customers[0]?.id || '');
    const [cartErrors, setCartErrors] = useState<Record<string, string>>({});
    const [passportNumber, setPassportNumber] = useState('');
    const [nationality, setNationality] = useState('');
    const [completedSale, setCompletedSale] = useState<Sale | null>(null);
    const [isTrainingMode, setIsTrainingMode] = useState(false);
    
    // State for role-based features
    const [isReturnMode, setIsReturnMode] = useState(false);
    const [discount, setDiscount] = useState<{ type: 'percentage' | 'fixed'; value: number } | null>(null);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [editingPriceFor, setEditingPriceFor] = useState<string | null>(null);

    // State for shortcuts and new features
    const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [selectedCartItemIndex, setSelectedCartItemIndex] = useState<number>(-1);
    
    // State for Age Verification
    const [isAgeVerificationModalOpen, setIsAgeVerificationModalOpen] = useState(false);
    const [productForVerification, setProductForVerification] = useState<Product | null>(null);
    
    const currentRole = useMemo(() => roles.find(r => r.id === currentUser!.roleId), [currentUser, roles]);
    const isCashier = currentRole?.name === 'Cashier';

    const [selectedLocationId, setSelectedLocationId] = useState<string>(currentUser!.businessLocationId);


    // Refs for Training Guide & Shortcuts
    const searchRef = useRef<HTMLInputElement>(null);
    const customerSelectRef = useRef<HTMLSelectElement>(null);
    const productGridRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);
    const chargeButtonRef = useRef<HTMLButtonElement>(null);
    const holdButtonRef = useRef<HTMLButtonElement>(null);
    const resumeButtonRef = useRef<HTMLButtonElement>(null);

    const canManageUsers = hasPermission('users:manage');
    const canApplyDiscount = hasPermission('pos:apply_discount');
    const canChangePrice = hasPermission('pos:change_price');
    const canProcessReturn = hasPermission('pos:process_return');


    if (!hasPermission('sell:pos') || !currentUser) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to access the POS.
                </p>
            </div>
        );
    }

    const productsMap = useMemo(() => new Map(allProducts.map(p => [p.id, p])), [allProducts]);
    
    const resetCart = useCallback(() => {
        setCart([]);
        setCartErrors({});
        setPassportNumber('');
        setNationality('');
        setSelectedCustomerId(customers.find(c => c.name === 'Walk-in Customer')?.id || customers[0]?.id || '');
        setSelectedCartItemIndex(-1);
        setDiscount(null);
        setIsReturnMode(false);
    }, [customers]);

    const handleLocationChange = (newLocationId: string) => {
        if (isCashier) return; // Prevent cashiers from changing location
        if (cart.length > 0) {
            if (window.confirm('Changing location will clear the current cart. Are you sure?')) {
                resetCart();
                setSelectedLocationId(newLocationId);
            }
        } else {
            setSelectedLocationId(newLocationId);
        }
    };

    const handleRequestTransfer = (product: Product, fromLocationId: string) => {
        addStockTransferRequest({
            productId: product.id,
            fromLocationId: fromLocationId,
            toLocationId: selectedLocationId,
            quantity: 1, // Default to 1 for now
            requestingUserId: currentUser.id
        });
        setShowSuccessMessage(`Transfer request for ${product.name} has been sent.`);
        setTimeout(() => setShowSuccessMessage(''), 3000);
    };

    const _addToCartInternal = useCallback((product: Product) => {
        const liveProduct = productsMap.get(product.id);
        if (!liveProduct || (liveProduct.stock <= 0 && !isReturnMode)) return;

        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
            const newCartErrors = { ...cartErrors };
            delete newCartErrors[product.id];

            if (existingItemIndex > -1) {
                const existingItem = prevCart[existingItemIndex];
                if (!isReturnMode && existingItem.quantity >= liveProduct.stock) {
                    newCartErrors[product.id] = `Max: ${liveProduct.stock}`;
                    setCartErrors(newCartErrors);
                    return prevCart;
                }
                setCartErrors(newCartErrors);
                 const newCart = [...prevCart];
                 newCart[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + 1 };
                 return newCart;
            } else {
                 setCartErrors(newCartErrors);
                 const newCart = [...prevCart, { ...liveProduct, quantity: 1 }];
                 setSelectedCartItemIndex(newCart.length - 1);
                 return newCart;
            }
        });
    }, [productsMap, cartErrors, isReturnMode]);

    const addToCart = useCallback((product: Product) => {
        if (product.isAgeRestricted && !isReturnMode) {
            setProductForVerification(product);
            setIsAgeVerificationModalOpen(true);
        } else {
            _addToCartInternal(product);
        }
    }, [_addToCartInternal, isReturnMode]);
    
    const handleVerificationSuccess = () => {
        if (productForVerification) {
            _addToCartInternal(productForVerification);
        }
        setIsAgeVerificationModalOpen(false);
        setProductForVerification(null);
    };

    const updateQuantity = useCallback((productId: string, newQuantity: number) => {
        setCart(prevCart => {
            const liveProduct = productsMap.get(productId);
            if (!liveProduct) return prevCart;

            const newCartErrors = { ...cartErrors };
            delete newCartErrors[productId];

            if (isNaN(newQuantity) || newQuantity <= 0) {
                setCartErrors(newCartErrors);
                const newCart = prevCart.filter(item => item.id !== productId);
                if (newCart.length === 0) setSelectedCartItemIndex(-1);
                else setSelectedCartItemIndex(prev => Math.min(prev, newCart.length -1));
                return newCart;
            }
            
            if (!isReturnMode && newQuantity > liveProduct.stock) {
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
    }, [productsMap, cartErrors, isReturnMode]);
    
    const removeItem = useCallback((productId: string) => {
        setCart(prev => {
            const newCart = prev.filter(item => item.id !== productId);
            if (newCart.length === 0) setSelectedCartItemIndex(-1);
            else setSelectedCartItemIndex(prevIdx => Math.min(prevIdx, newCart.length - 1));
            return newCart;
        });
        const newCartErrors = { ...cartErrors };
        delete newCartErrors[productId];
        setCartErrors(newCartErrors);
    }, [cartErrors]);
    
     const handleHoldOrder = useCallback(() => {
        if (cart.length === 0) return;
        const customer = customers.find(c => c.id === selectedCustomerId);
        const newHeldOrder: HeldOrder = {
            id: Date.now(),
            cart: cart,
            customerId: selectedCustomerId,
            customerName: customer?.name || 'Unknown',
        };
        setHeldOrders(prev => [...prev, newHeldOrder]);
        resetCart();
    }, [cart, selectedCustomerId, customers, resetCart]);

    const handleResumeOrder = (orderId: number) => {
        const orderToResume = heldOrders.find(o => o.id === orderId);
        if (orderToResume) {
            setCart(orderToResume.cart);
            setSelectedCustomerId(orderToResume.customerId);
            setHeldOrders(prev => prev.filter(o => o.id !== orderId));
            setIsResumeModalOpen(false);
        }
    };

    const filteredProducts = useMemo(() => allProducts.filter(product =>
        product.businessLocationId === selectedLocationId &&
        (isReturnMode || !product.isNotForSale) &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [allProducts, searchTerm, isReturnMode, selectedLocationId]);
    
    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.originalPrice ?? item.price) * item.quantity, 0), [cart]);

    const discountAmount = useMemo(() => {
        if (!discount) return 0;
        return discount.type === 'percentage'
            ? (subtotal * discount.value) / 100
            : discount.value;
    }, [subtotal, discount]);
    
    const totalAfterDiscount = subtotal - discountAmount;
    const tax = totalAfterDiscount * 0.08;
    const total = totalAfterDiscount + tax;

    const handleConfirmPayment = (payments: { methodId: string; amount: number }[]) => {
        const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
        if (!selectedCustomer) {
            alert('Error: Please select a valid customer.');
            return;
        }

        const saleData = {
            customer: { id: selectedCustomer.id, name: selectedCustomer.name },
            items: cart,
            total,
            payments,
            passportNumber,
            nationality,
            discount,
            status: isReturnMode ? 'return' : 'completed',
        };

        const newSale = isOnline ? addSale(saleData) : addSaleToQueue(saleData);
        
        setIsPaymentModalOpen(false);
        setCompletedSale(newSale);
    };

    const handleCloseReceipt = () => {
        setCompletedSale(null);
        resetCart();
        setShowSuccessMessage('Sale Completed Successfully!');
        setTimeout(() => setShowSuccessMessage(''), 3000);
    };
    
    const resetTrainingState = useCallback(() => {
        setCart([]);
        setCartErrors({});
        setIsPaymentModalOpen(false);
        setHeldOrders([]);
        setIsResumeModalOpen(false);
    }, []);

    const handleStartTraining = () => {
        resetTrainingState();
        setIsTrainingMode(true);
    };

    const handleEndTraining = () => {
        setIsTrainingMode(false);
        resetTrainingState();
    };
    
     // Keyboard Shortcuts Handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
            if (editingPriceFor) return; // Disable shortcuts while editing price

            // Global shortcuts that should always work
            if (e.key === 'F1' || ((e.metaKey || e.ctrlKey) && e.key === 's')) {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === 'F2' || ((e.metaKey || e.ctrlKey) && e.key === 'c')) {
                e.preventDefault();
                customerSelectRef.current?.focus();
            }
             if (e.key === 'F6') {
                e.preventDefault();
                if(cart.length > 0) handleHoldOrder();
            }
            if (e.key === 'F7') {
                e.preventDefault();
                setIsResumeModalOpen(true);
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setSearchTerm('');
                setSelectedCartItemIndex(-1);
                searchRef.current?.blur();
            }
            
            // Shortcuts that shouldn't fire when typing in an input
            if (!isInputFocused) {
                 if (e.key === 'Enter' && cart.length > 0 && !isPaymentModalOpen && !isResumeModalOpen) {
                    e.preventDefault();
                    setIsPaymentModalOpen(true);
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedCartItemIndex(prev => Math.min(prev + 1, cart.length - 1));
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedCartItemIndex(prev => Math.max(prev - 1, 0));
                }
                 // Actions on selected item
                if (selectedCartItemIndex > -1 && cart[selectedCartItemIndex]) {
                    const selectedItem = cart[selectedCartItemIndex];
                    if (e.key === '+' || e.key === '=') {
                        e.preventDefault();
                        updateQuantity(selectedItem.id, selectedItem.quantity + 1);
                    }
                    if (e.key === '-') {
                        e.preventDefault();
                        updateQuantity(selectedItem.id, selectedItem.quantity - 1);
                    }
                    if (e.key === 'Delete' || e.key === 'Backspace') {
                        e.preventDefault();
                        removeItem(selectedItem.id);
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [cart, selectedCartItemIndex, isPaymentModalOpen, isResumeModalOpen, updateQuantity, removeItem, handleHoldOrder, editingPriceFor]);
    
    const handlePriceUpdate = (productId: string, newPriceStr: string) => {
        const newPrice = parseFloat(newPriceStr);
        setCart(prev => prev.map(item => {
            if (item.id === productId && !isNaN(newPrice) && newPrice >= 0) {
                return { ...item, price: newPrice, originalPrice: item.originalPrice ?? productsMap.get(item.id)!.price };
            }
            return item;
        }));
    };


    return (
        <div className={`relative flex flex-col lg:flex-row h-[calc(100vh-10rem)] gap-6 ${isReturnMode ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
             {showSuccessMessage && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-lg font-semibold z-20">
                    {showSuccessMessage}
                </div>
            )}
             {isTrainingMode && (
                <TrainingGuide
                    onClose={handleEndTraining}
                    elementRefs={{ searchRef, productGridRef, cartRef, chargeButtonRef, holdButtonRef, resumeButtonRef }}
                    setCart={setCart}
                    setIsPaymentModalOpen={setIsPaymentModalOpen}
                    resetTrainingState={resetTrainingState}
                    products={allProducts}
                    cart={cart}
                    heldOrders={heldOrders}
                    setHeldOrders={setHeldOrders}
                    setIsResumeModalOpen={setIsResumeModalOpen}
                    handleResumeOrder={handleResumeOrder}
                    resetCart={resetCart}
                />
            )}
            {isDiscountModalOpen && (
                <DiscountModal
                    onClose={() => setIsDiscountModalOpen(false)}
                    onApply={(type, value) => {
                        setDiscount({ type, value });
                        setIsDiscountModalOpen(false);
                    }}
                />
            )}
             {isAgeVerificationModalOpen && (
                <AgeVerificationModal
                    isOpen={isAgeVerificationModalOpen}
                    minimumAge={ageVerificationSettings.minimumAge}
                    onSuccess={handleVerificationSuccess}
                    onClose={() => {
                        setIsAgeVerificationModalOpen(false);
                        setProductForVerification(null);
                    }}
                />
            )}
            {/* Products Grid */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                     <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Scan or Search products... (F1)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="w-48">
                             <label htmlFor="pos-location" className="sr-only">Location</label>
                             <select
                                id="pos-location"
                                value={selectedLocationId}
                                onChange={e => handleLocationChange(e.target.value)}
                                disabled={isCashier}
                                className="block w-full text-sm rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {businessLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                         {canManageUsers && (
                            <button
                                onClick={handleStartTraining}
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-yellow-900 font-semibold hover:bg-yellow-500 transition-colors"
                                title="Start Training Mode"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.394 2.08a1 1 0 00-1.788 0l-7 14a1 1 0 00.894 1.42h14a1 1 0 00.894-1.42l-7-14zM10 9a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1zm-1-3a1 1 0 112 0 1 1 0 01-2 0z" />
                                </svg>
                                <span>Train</span>
                            </button>
                        )}
                    </div>
                </div>
                <div ref={productGridRef} className="p-4 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => {
                            const availableElsewhere = allProducts.find(p => p.sku === product.sku && p.businessLocationId !== selectedLocationId && p.stock > 0);
                            const canRequestTransfer = product.stock === 0 && availableElsewhere && isCashier;
                            const isOutOfStock = product.stock <= 0 && !isReturnMode;
                            
                            return (
                                <div 
                                    key={product.id} 
                                    onClick={() => !isOutOfStock && addToCart(product)} 
                                    className={`relative border dark:border-slate-700 rounded-lg p-2 text-center group transition-all  
                                        ${(isOutOfStock && !canRequestTransfer) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:border-indigo-500 hover:scale-105'}`}
                                >
                                {isOutOfStock && !canRequestTransfer && <span className="absolute top-1 right-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full z-10">Out of Stock</span>}
                                {canRequestTransfer && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRequestTransfer(product, availableElsewhere.businessLocationId); }}
                                        className="absolute top-1 right-1 text-xs bg-blue-600 text-white px-2 py-1 rounded-full z-10 hover:bg-blue-700"
                                        title={`Available at ${businessLocations.find(l => l.id === availableElsewhere.businessLocationId)?.name}`}
                                    >
                                        Request Transfer
                                    </button>
                                )}
                                {product.isAgeRestricted && <span className="absolute top-1 left-1 text-xs bg-orange-400 text-white px-1.5 py-0.5 rounded-full z-10">ID Req.</span>}
                                 <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2"/>
                                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{product.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stock: {product.stock}</p>
                                <p className="text-xs font-semibold text-indigo-500">{formatCurrency(product.price)}</p>
                            </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Cart/Order */}
            <div ref={cartRef} className="w-full lg:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col">
                 <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{isReturnMode ? 'Process Return' : `Current Order (${cart.length})`}</h2>
                         {canProcessReturn && (
                            <button onClick={() => setIsReturnMode(!isReturnMode)} className={`px-3 py-1 text-sm font-semibold rounded-full ${isReturnMode ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                {isReturnMode ? 'Return Mode' : 'Sale Mode'}
                            </button>
                         )}
                    </div>
                     <div className="mt-2 space-y-2">
                        <div>
                            <label htmlFor="pos-customer" className="sr-only">Customer (F2)</label>
                            <select 
                                id="pos-customer"
                                ref={customerSelectRef}
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
                            {cart.map((item, index) => (
                                <li key={item.id} className={`flex items-center space-x-3 p-1 rounded-md transition-colors ${selectedCartItemIndex === index ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}>
                                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0"/>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate" title={item.name}>{item.name}</p>
                                        {editingPriceFor === item.id ? (
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={e => handlePriceUpdate(item.id, e.target.value)}
                                                onBlur={() => setEditingPriceFor(null)}
                                                onKeyDown={e => e.key === 'Enter' && setEditingPriceFor(null)}
                                                autoFocus
                                                className="w-20 text-xs bg-white dark:bg-slate-900 rounded-md border border-indigo-500"
                                            />
                                        ) : (
                                            <p onClick={() => canChangePrice && setEditingPriceFor(item.id)} className={`text-xs ${item.originalPrice ? 'text-orange-500' : 'text-slate-500'} ${canChangePrice ? 'cursor-pointer' : ''}`}>
                                                {formatCurrency(item.price)}
                                                {item.originalPrice && <span className="line-through ml-1">{formatCurrency(item.originalPrice)}</span>}
                                            </p>
                                        )}
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
                                                className={`w-12 text-center bg-transparent focus:outline-none text-sm font-semibold training-cart-item-quantity ${cartErrors[item.id] ? 'text-red-500' : ''}`}
                                                aria-label="Item quantity"
                                            />
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-r-md" aria-label="Increase quantity">
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>
                                            </button>
                                        </div>
                                         {cartErrors[item.id] && <p className="text-xs text-red-500 text-center mt-1">{cartErrors[item.id]}</p>}
                                    </div>
                                    <p className="font-semibold w-16 text-right flex-shrink-0">{formatCurrency(item.price * item.quantity)}</p>
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
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                     {canApplyDiscount && (
                        <div className="flex justify-between text-sm">
                           <button onClick={() => setIsDiscountModalOpen(true)} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                               {discount ? 'Edit Discount' : 'Add Discount'}
                           </button>
                            {discount && <span className="font-medium text-red-500">(-{formatCurrency(discountAmount)})</span>}
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Tax (8%)</span>
                        <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className={`flex justify-between font-bold text-xl ${isReturnMode ? 'text-red-500' : ''}`}>
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button ref={holdButtonRef} onClick={handleHoldOrder} className="w-full bg-yellow-500 text-yellow-900 p-2 rounded-lg font-bold text-base hover:bg-yellow-600 disabled:bg-yellow-300" disabled={cart.length === 0}>
                            Hold (F6)
                        </button>
                         <button ref={resumeButtonRef} onClick={() => setIsResumeModalOpen(true)} className="w-full bg-blue-500 text-white p-2 rounded-lg font-bold text-base hover:bg-blue-600">
                            Resume (F7)
                        </button>
                    </div>
                    <button ref={chargeButtonRef} onClick={() => setIsPaymentModalOpen(true)} className={`w-full p-3 rounded-lg font-bold text-lg text-white ${isReturnMode ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300' : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'}`} disabled={cart.length === 0}>
                        {isReturnMode ? 'Process Return' : 'Charge (Enter)'}
                    </button>
                </div>
            </div>

            {isPaymentModalOpen && (
                <SplitPaymentModal 
                    total={total}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handleConfirmPayment}
                />
            )}
            {completedSale && (
                <SaleReceipt sale={completedSale} onClose={handleCloseReceipt} />
            )}
            <ResumeOrderModal
                isOpen={isResumeModalOpen}
                onClose={() => setIsResumeModalOpen(false)}
                heldOrders={heldOrders}
                onResume={handleResumeOrder}
            />
        </div>
    );
};

export default POSPage;