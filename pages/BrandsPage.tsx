import React from 'react';
import ProductFeatureManagementPage from './ProductFeatureManagementPage';
import { useAuth } from '../contexts/AuthContext';
import { Brand } from '../types';

const BrandsPage: React.FC = () => {
    const { brands, addBrand, updateBrand, deleteBrand, hasPermission } = useAuth();

    return (
        <ProductFeatureManagementPage
            title="Brands"
            items={brands}
            onAddItem={addBrand}
            onUpdateItem={updateBrand}
            onDeleteItem={deleteBrand}
            canManage={hasPermission('products:brands')}
            itemDisplayName="brand"
            formFields={[{ name: 'name', label: 'Brand Name', type: 'text', required: true }]}
            tableHeaders={['Brand Name']}
            renderRow={(item: Brand) => (
                <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {item.name}
                </td>
            )}
        />
    );
};

export default BrandsPage;