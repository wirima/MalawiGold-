import React from 'react';
import ProductFeatureManagementPage from './ProductFeatureManagementPage';
import { useAuth } from '../contexts/AuthContext';
import { BankAccount } from '../types';

const BankAccountsPage: React.FC = () => {
    const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, hasPermission } = useAuth();

    if (!hasPermission('settings:accounts')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage bank accounts.
                </p>
            </div>
        );
    }
    
    return (
        <ProductFeatureManagementPage
            title="Bank Accounts"
            items={bankAccounts}
            onAddItem={addBankAccount}
            onUpdateItem={updateBankAccount}
            onDeleteItem={deleteBankAccount}
            canManage={hasPermission('settings:accounts')}
            itemDisplayName="bank account"
            formFields={[
                { name: 'accountName', label: 'Account Name', type: 'text', required: true },
                { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
                { name: 'accountNumber', label: 'Account Number', type: 'text', required: true }
            ]}
            tableHeaders={['Account Name', 'Bank Name', 'Account Number']}
            renderRow={(item: BankAccount) => (
                <>
                    <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {item.accountName}
                    </td>
                    <td className="px-6 py-4">{item.bankName}</td>
                    <td className="px-6 py-4">{item.accountNumber}</td>
                </>
            )}
        />
    );
};

export default BankAccountsPage;