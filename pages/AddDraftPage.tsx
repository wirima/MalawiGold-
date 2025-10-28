
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartItem, Customer } from '../types';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SaleEditor from '../components/SaleEditor';

const AddDraftPage: React.FC = () => {
    const { drafts, addDraft, updateDraft, hasPermission } = useAuth();
    const navigate = useNavigate();
    const { draftId } = useParams<{ draftId: string }>();
    
    const isEditing = !!draftId;
    const draftToEdit = isEditing ? drafts.find(d => d.id === draftId) : undefined;

    if (!hasPermission('sell:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage drafts.
                </p>
                 <Link to="/sell/drafts" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Drafts
                </Link>
            </div>
        );
    }

    if (isEditing && !draftToEdit) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Draft Not Found</h1>
                 <Link to="/sell/drafts" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Drafts
                </Link>
            </div>
        );
    }

    const handleSaveDraft = (cart: CartItem[], customer: Customer, total: number) => {
        if (cart.length === 0) {
            alert('Cannot save an empty draft.');
            return;
        }
        
        const draftData = {
            customer: { id: customer.id, name: customer.name },
            items: cart,
            total,
        };

        if (isEditing && draftToEdit) {
            updateDraft({ ...draftToEdit, ...draftData });
        } else {
            addDraft(draftData);
        }
        
        navigate('/sell/drafts');
    };

    return (
       <SaleEditor 
            onSave={handleSaveDraft}
            pageTitle={isEditing ? `Edit Draft ${draftId}` : 'Add New Draft'}
            saveButtonText={isEditing ? 'Save Changes' : 'Save Draft'}
            initialCart={draftToEdit?.items}
            initialCustomerId={draftToEdit?.customer.id}
       />
    );
};

export default AddDraftPage;