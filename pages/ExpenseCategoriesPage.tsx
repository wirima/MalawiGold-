
import React from 'react';
import ProductFeatureManagementPage from './ProductFeatureManagementPage';
import { useAuth } from '../contexts/AuthContext';
import { ExpenseCategory } from '../types';

const ExpenseCategoriesPage: React.FC = () => {
    const { expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory, hasPermission } = useAuth();

    return (
        <ProductFeatureManagementPage
            title="Expense Categories"
            items={expenseCategories}
            onAddItem={addExpenseCategory}
            onUpdateItem={updateExpenseCategory}
            onDeleteItem={deleteExpenseCategory}
            canManage={hasPermission('expense:manage')}
            itemDisplayName="category"
            formFields={[{ name: 'name', label: 'Category Name', type: 'text', required: true }]}
            tableHeaders={['Category Name']}
            renderRow={(item: ExpenseCategory) => (
                <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {item.name}
                </td>
            )}
        />
    );
};

export default ExpenseCategoriesPage;
