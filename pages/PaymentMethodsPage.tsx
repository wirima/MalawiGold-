import React from 'react';
import ProductFeatureManagementPage from './ProductFeatureManagementPage';
import { useAuth } from '../contexts/AuthContext';
import { PaymentMethod } from '../types';

const PaymentMethodsPage: React.FC = () => {
    const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, hasPermission } = useAuth();

    if (!hasPermission('settings:payment')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage payment methods.
                </p>
            </div>
        );
    }
    
    return (
        <ProductFeatureManagementPage
            title="Payment Methods"
            items={paymentMethods}
            onAddItem={addPaymentMethod}
            onUpdateItem={updatePaymentMethod}
            onDeleteItem={deletePaymentMethod}
            canManage={hasPermission('settings:payment')}
            itemDisplayName="payment method"
            formFields={[{ name: 'name', label: 'Method Name', type: 'text', required: true }]}
            tableHeaders={['Method Name']}
            renderRow={(item: PaymentMethod) => (
                <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {item.name}
                </td>
            )}
        />
    );
};

export default PaymentMethodsPage;