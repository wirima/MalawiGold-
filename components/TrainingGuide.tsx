import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Product, CartItem } from '../types';

interface HeldOrder {
    id: number;
    cart: CartItem[];
    customerId: string;
    customerName: string;
}

interface TrainingGuideProps {
    onClose: () => void;
    elementRefs: {
        searchRef: React.RefObject<HTMLElement>;
        productGridRef: React.RefObject<HTMLElement>;
        cartRef: React.RefObject<HTMLElement>;
        chargeButtonRef: React.RefObject<HTMLElement>;
        holdButtonRef: React.RefObject<HTMLElement>;
        resumeButtonRef: React.RefObject<HTMLElement>;
    };
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    setIsPaymentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    resetTrainingState: () => void;
    products: Product[];
    cart: CartItem[];
    heldOrders: HeldOrder[];
    setHeldOrders: React.Dispatch<React.SetStateAction<HeldOrder[]>>;
    setIsResumeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleResumeOrder: (orderId: number) => void;
    resetCart: () => void;
}

type StepTarget = 
    | { type: 'ref'; ref: keyof TrainingGuideProps['elementRefs'] }
    | { type: 'selector'; selector: string }
    | { type: 'none' };

interface Step {
    target: StepTarget;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: () => void;
}

const TrainingGuide: React.FC<TrainingGuideProps> = ({ 
    onClose, 
    elementRefs, 
    setCart, 
    setIsPaymentModalOpen, 
    resetTrainingState, 
    products,
    cart,
    heldOrders,
    setHeldOrders,
    setIsResumeModalOpen,
    handleResumeOrder,
    resetCart
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [styles, setStyles] = useState({
        highlight: { opacity: 0 },
        tooltip: { opacity: 0 }
    });

    const sampleProduct = products.find(p => p.stock > 1 && p.name === 'Espresso') || products.find(p => p.stock > 1);

    const steps: Step[] = [
        {
            target: { type: 'none' },
            position: 'center',
            content: (
                <>
                    <h3 className="font-bold text-lg">Welcome to the Enhanced Training!</h3>
                    <p className="mt-2 text-sm">This guide covers new features like holding orders and split payments. Let's begin!</p>
                </>
            ),
        },
        {
            target: { type: 'ref', ref: 'searchRef' },
            position: 'bottom',
            content: "Let's start a sale. Use the search bar to find products. You can also press F1 to focus here anytime.",
        },
        {
            target: { type: 'ref', ref: 'productGridRef' },
            position: 'right',
            content: `Click a product to add it to the cart. We'll add one for you.`,
            action: () => {
                if (sampleProduct) {
                    setCart([{ ...sampleProduct, quantity: 1 }]);
                }
            },
        },
        {
            target: { type: 'selector', selector: '.training-cart-item-quantity' },
            position: 'left',
            content: "You can use the '+ / -' keys to change the quantity of a selected item. Let's add another one.",
            action: () => {
                if (sampleProduct && sampleProduct.stock >= 2) {
                    setCart([{ ...sampleProduct, quantity: 2 }]);
                }
            },
        },
        {
            target: { type: 'ref', ref: 'holdButtonRef' },
            position: 'top',
            content: "New feature: If a customer needs to step away, press F6 or click 'Hold' to save their cart.",
            action: () => {
                const customer = { id: 'CUST003', name: 'Walk-in Customer' }; // Assuming default customer
                if (cart.length > 0) {
                    setHeldOrders([{ id: Date.now(), cart, customerId: customer.id, customerName: customer.name }]);
                    resetCart();
                }
            },
        },
        {
            target: { type: 'ref', ref: 'resumeButtonRef' },
            position: 'top',
            content: "To bring back a held order, press F7 or click 'Resume'. This opens a list of held orders.",
            action: () => {
                setIsResumeModalOpen(true);
            },
        },
        {
            target: { type: 'selector', selector: `[data-testid^="resume-order-"]` },
            position: 'bottom',
            content: 'Click "Resume" on the order you want to restore.',
            action: () => {
                if (heldOrders.length > 0) {
                    handleResumeOrder(heldOrders[0].id);
                }
            },
        },
        {
            target: { type: 'ref', ref: 'chargeButtonRef' },
            position: 'top',
            content: "The order is back. Now press Enter or click 'Charge' to proceed to the new split payment screen.",
            action: () => {
                setIsPaymentModalOpen(true);
            },
        },
        {
            target: { type: 'selector', selector: '[data-testid="payment-amount-input"]' },
            position: 'bottom',
            content: 'In the new payment modal, you can split payments. For example, enter an amount and press Alt+C for Cash, Alt+R for Card, etc.',
        },
        {
            target: { type: 'selector', selector: '[data-testid="confirm-payment-button"]' },
            position: 'top',
            content: 'Once the remaining balance is zero, the "Confirm" button becomes active. Pressing Enter or clicking it finalizes the sale.',
            action: () => {
                setIsPaymentModalOpen(false);
            },
        },
        {
            target: { type: 'none' },
            position: 'center',
            content: (
                <>
                    <h3 className="font-bold text-lg">Training Complete!</h3>
                    <p className="mt-2 text-sm">You've now seen how to use hold/resume and the split payment screen. You can end training now.</p>
                </>
            ),
            action: () => resetTrainingState(),
        },
    ];

    useLayoutEffect(() => {
        const step = steps[currentStep];
        if (!step) return;
        
        // The action might open a modal, so we delay finding the element to give it time to render.
        const timer = setTimeout(() => {
            let targetElement: HTMLElement | null = null;
            if (step.target.type === 'ref') {
                targetElement = elementRefs[step.target.ref]?.current;
            } else if (step.target.type === 'selector') {
                targetElement = document.querySelector(step.target.selector);
            }

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                const rect = targetElement.getBoundingClientRect();
                const highlightPadding = 8;
                
                const newHighlightStyle: React.CSSProperties = {
                    width: rect.width + highlightPadding * 2,
                    height: rect.height + highlightPadding * 2,
                    top: rect.top - highlightPadding,
                    left: rect.left - highlightPadding,
                    opacity: 1,
                };

                let newTooltipStyle: React.CSSProperties = { opacity: 1, transform: 'translateY(0)' };
                
                switch (step.position) {
                    case 'top':
                        newTooltipStyle.bottom = window.innerHeight - rect.top + 16;
                        newTooltipStyle.left = rect.left + rect.width / 2;
                        newTooltipStyle.transform = 'translateX(-50%)';
                        break;
                    case 'bottom':
                        newTooltipStyle.top = rect.bottom + 16;
                        newTooltipStyle.left = rect.left + rect.width / 2;
                        newTooltipStyle.transform = 'translateX(-50%)';
                        break;
                    case 'left':
                        newTooltipStyle.top = rect.top + rect.height / 2;
                        newTooltipStyle.right = window.innerWidth - rect.left + 16;
                        newTooltipStyle.transform = 'translateY(-50%)';
                        break;
                    case 'right':
                        newTooltipStyle.top = rect.top + rect.height / 2;
                        newTooltipStyle.left = rect.right + 16;
                        newTooltipStyle.transform = 'translateY(-50%)';
                        break;
                    default: // center
                        newTooltipStyle.top = '50%';
                        newTooltipStyle.left = '50%';
                        newTooltipStyle.transform = 'translate(-50%, -50%)';
                }
                
                setStyles({ highlight: newHighlightStyle, tooltip: newTooltipStyle });
            } else { // No target element (e.g. intro/outro)
                setStyles({ 
                    highlight: { opacity: 0 }, 
                    tooltip: { opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                });
            }
        }, 100); // 100ms delay to allow modals to appear

        return () => clearTimeout(timer);

    }, [currentStep, elementRefs, heldOrders]); // Re-run effect if heldOrders changes to find the new element

    const handleNext = () => {
        // Execute action before going to the next step
        const step = steps[currentStep];
        step.action?.();
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };
    
    const handlePrev = () => {
        // We might need to "undo" actions here in a more complex scenario,
        // but for now, just going back is fine.
        resetTrainingState(); // Reset state to ensure consistency when going back.
        setCurrentStep(prev => Math.max(0, prev - 1));
    };
    
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />
            <div
                className="fixed border-4 border-indigo-500 rounded-lg shadow-2xl transition-all duration-300 z-50 pointer-events-none"
                style={styles.highlight}
            />
            <div
                className="fixed bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-4 w-80 z-50 transition-all duration-300"
                style={styles.tooltip}
            >
                {steps[currentStep].content}
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500">{currentStep + 1} / {steps.length}</span>
                    <div className="flex gap-2">
                        {!isFirstStep && <button onClick={handlePrev} className="px-3 py-1 text-sm rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Prev</button>}
                        {isLastStep ? (
                            <button onClick={onClose} className="px-3 py-1 text-sm rounded-md bg-green-600 text-white font-semibold hover:bg-green-700">End Training</button>
                        ) : (
                            <button onClick={handleNext} className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Next</button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TrainingGuide;