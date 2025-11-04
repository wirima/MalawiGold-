import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartItem, Customer } from '../types';
import { useNavigate, useParams, Link } from 'react-router-dom';
import QuotationEditor from '../components/QuotationEditor';

const AddQuotationPage: React.FC = () => {
    const { quotations, addQuotation, updateQuotation, hasPermission } = useAuth();
    const navigate = useNavigate();
    const { quotationId } = useParams<{ quotationId: string }>();
    
    const isEditing = !!quotationId;
    const quotationToEdit = isEditing ? quotations.find(d => d.id === quotationId) : undefined;

    if (!hasPermission('sell:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage quotations.
                </p>
                 <Link to="/sell/quotations" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Quotations
                </Link>
            </div>
        );
    }

    if (isEditing && !quotationToEdit) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Quotation Not Found</h1>
                 <Link to="/sell/quotations" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Quotations
                </Link>
            </div>
        );
    }

    const handleSaveQuotation = (cart: CartItem[], customer: Customer, total: number, expiryDate: string, passportNumber?: string, nationality?: string) => {
        const quotationData = {
            customer: { id: customer.id, name: customer.name },
            items: cart,
            total,
            expiryDate,
        };

        if (isEditing && quotationToEdit) {
            updateQuotation({ ...quotationToEdit, ...quotationData });
        } else {
            addQuotation(quotationData);
        }
        
        navigate('/sell/quotations');
    };

    return (
       <QuotationEditor 
            onSave={handleSaveQuotation}
            pageTitle={isEditing ? `Edit Quotation ${quotationId}` : 'Add New Quotation'}
            saveButtonText={isEditing ? 'Save Changes' : 'Save Quotation'}
            initialCart={quotationToEdit?.items}
            initialCustomerId={quotationToEdit?.customer.id}
            initialExpiryDate={quotationToEdit?.expiryDate ? new Date(quotationToEdit.expiryDate).toISOString().split('T')[0] : ''}
       />
    );
};

export default AddQuotationPage;
