
import React from 'react';
import ProductFeatureManagementPage from './ProductFeatureManagementPage';
import { useAuth } from '../contexts/AuthContext';
import { Category } from '../types';

const CategoriesPage: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, hasPermission } = useAuth();

    return (
        <ProductFeatureManagementPage
            title="Categories"
            items={categories}
            onAddItem={addCategory}
            onUpdateItem={updateCategory}
            onDeleteItem={deleteCategory}
            canManage={hasPermission('products:categories')}
            itemDisplayName="category"
            formFields={[{ name: 'name', label: 'Category Name', type: 'text', required: true }]}
            tableHeaders={['Category Name']}
            renderRow={(item: Category) => (
                <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {item.name}
                </td>
            )}
        />
    );
};

export default CategoriesPage;
