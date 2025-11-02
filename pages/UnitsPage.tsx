import React from 'react';
import ProductFeatureManagementPage from './ProductFeatureManagementPage';
import { useAuth } from '../contexts/AuthContext';
import { Unit } from '../types';

const UnitsPage: React.FC = () => {
    const { units, addUnit, updateUnit, deleteUnit, hasPermission } = useAuth();

    return (
        <ProductFeatureManagementPage
            title="Units"
            items={units}
            onAddItem={addUnit}
            onUpdateItem={updateUnit}
            onDeleteItem={deleteUnit}
            canManage={hasPermission('products:units')}
            itemDisplayName="unit"
            formFields={[
                { name: 'name', label: 'Unit Name', type: 'text', required: true },
                { name: 'shortName', label: 'Short Name', type: 'text', required: true }
            ]}
            tableHeaders={['Unit Name', 'Short Name']}
            renderRow={(item: Unit) => (
                <>
                    <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {item.name}
                    </td>
                    <td className="px-6 py-4">
                        {item.shortName}
                    </td>
                </>
            )}
        />
    );
};

export default UnitsPage;
