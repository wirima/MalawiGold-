import React from 'react';
import ProductFeatureManagementPage from './ProductFeatureManagementPage';
import { useAuth } from '../contexts/AuthContext';
import { BusinessLocation } from '../types';

const BusinessLocationsPage: React.FC = () => {
    const { businessLocations, addBusinessLocation, updateBusinessLocation, deleteBusinessLocation, hasPermission } = useAuth();

    return (
        <ProductFeatureManagementPage
            title="Business Locations"
            items={businessLocations}
            onAddItem={addBusinessLocation}
            onUpdateItem={updateBusinessLocation}
            onDeleteItem={deleteBusinessLocation}
            canManage={hasPermission('settings:locations')}
            itemDisplayName="location"
            formFields={[{ name: 'name', label: 'Location Name', type: 'text', required: true }]}
            tableHeaders={['Location Name']}
            renderRow={(item: BusinessLocation) => (
                <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {item.name}
                </td>
            )}
        />
    );
};

export default BusinessLocationsPage;
