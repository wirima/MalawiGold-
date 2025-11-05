import React from 'react';
import { downloadCSV } from '../utils';
import ImportFilePage from '../components/ImportFilePage';

const ImportContactsPage: React.FC = () => {
    
    const headers = [
        'contact_type', // customer or supplier
        'name',
        'business_name', // optional
        'email',
        'phone',
        'address',
        'customer_group_name' // for customers only
    ];

    const handleDownloadCsv = () => {
        downloadCSV('contacts_template.csv', headers);
    };

    const handleDownloadExcel = () => {
        downloadCSV('contacts_template.xlsx', headers);
    };

    return (
        <ImportFilePage
            title="Import Contacts"
            description="Bulk upload new customers or suppliers from a CSV or Excel file."
            instructions={[
                "Download one of the template files to see the required format.",
                "Required columns: contact_type, name.",
                "Set 'contact_type' to either 'customer' or 'supplier'.",
                "For customers, 'customer_group_name' must exactly match an existing customer group in the system.",
                "Name, email, and phone must be unique across all contacts (customers and suppliers)."
            ]}
            onDownloadCsv={handleDownloadCsv}
            onDownloadExcel={handleDownloadExcel}
            permission="contacts:import"
        />
    );
}

export default ImportContactsPage;