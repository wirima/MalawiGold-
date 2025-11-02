import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartItem, Supplier } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import PurchaseEditor from '../components/PurchaseEditor';

const AddPurchasePage: React.FC = () => {
    const { addPurchase, hasPermission } = useAuth();
    const navigate = useNavigate();

    if (!hasPermission('purchases:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to add purchases.
                </p>
                 <Link to="/purchases" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Purchases
                </Link>
            </div>
        );
    }

    const handleFinalizePurchase = (cart: CartItem[], supplier: Supplier, total: number) => {
        addPurchase({
            supplier: { id: supplier.id, name: supplier.name },
            items: cart,
            total,
        });
        navigate('/purchases');
    };

    return (
       <PurchaseEditor 
            onSave={handleFinalizePurchase}
            pageTitle="Add New Purchase"
            saveButtonText="Save Purchase"
            mode="purchase"
       />
    );
};

export default AddPurchasePage;