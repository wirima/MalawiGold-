
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartItem } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import StockTransferEditor from '../components/StockTransferEditor';

const AddStockTransferPage: React.FC = () => {
    const { addStockTransfer, hasPermission } = useAuth();
    const navigate = useNavigate();

    if (!hasPermission('stock_transfer:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to add stock transfers.
                </p>
                 <Link to="/stock-transfers" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Stock Transfers
                </Link>
            </div>
        );
    }

    const handleFinalizeTransfer = (cart: CartItem[], fromLocationId: string, toLocationId: string) => {
        addStockTransfer({
            fromLocationId,
            toLocationId,
            items: cart,
            status: 'in_transit'
        });
        navigate('/stock-transfers');
    };

    return (
       <StockTransferEditor
            onSave={handleFinalizeTransfer}
            pageTitle="Add New Stock Transfer"
            saveButtonText="Save Transfer"
       />
    );
};

export default AddStockTransferPage;
