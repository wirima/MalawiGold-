import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartItem, Supplier } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import PurchaseEditor from '../components/PurchaseEditor';

const AddPurchaseReturnPage: React.FC = () => {
    const { addPurchaseReturn, hasPermission } = useAuth();
    const navigate = useNavigate();

    if (!hasPermission('purchases:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to add purchase returns.
                </p>
                 <Link to="/purchases/returns" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Purchase Returns
                </Link>
            </div>
        );
    }

    const handleFinalizeReturn = (cart: CartItem[], supplier: Supplier, total: number) => {
        addPurchaseReturn({
            supplier: { id: supplier.id, name: supplier.name },
            items: cart,
            total,
        });
        navigate('/purchases/returns');
    };

    return (
       <PurchaseEditor 
            onSave={handleFinalizeReturn}
            pageTitle="Add Purchase Return"
            saveButtonText="Save Return"
            mode="return"
       />
    );
};

export default AddPurchaseReturnPage;