

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartItem, Customer } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import SaleEditor from '../components/SaleEditor';

const AddSalePage: React.FC = () => {
    const { addSale, hasPermission } = useAuth();
    const navigate = useNavigate();

    if (!hasPermission('sell:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to add sales.
                </p>
                 <Link to="/sell/sales" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to All Sales
                </Link>
            </div>
        );
    }

    const handleFinalizeSale = (cart: CartItem[], customer: Customer, total: number, passportNumber?: string, nationality?: string) => {
        if (cart.length === 0) {
            alert('Cannot save an empty sale.');
            return;
        }
        addSale({
            customer: { id: customer.id, name: customer.name },
            items: cart,
            total,
            payments: [{ methodId: 'pay_cash', amount: total }], // Default payment method for manual entry
            passportNumber,
            nationality
        });
        navigate('/sell/sales');
    };

    return (
       <SaleEditor 
            onSave={handleFinalizeSale}
            pageTitle="Add New Sale"
            saveButtonText="Save Sale"
       />
    );
};

export default AddSalePage;