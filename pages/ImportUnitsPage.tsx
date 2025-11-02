import React from 'react';
import { downloadCSV } from '../utils';
import ImportFilePage from '../components/ImportFilePage';

const ImportUnitsPage: React.FC = () => {
    
    const handleDownloadTemplate = () => {
        const headers = [
            'unit_name', 'short_name'
        ];
        downloadCSV('units_template.csv', headers);
    };

    return (
        <ImportFilePage
            title="Import Units"
            description="Bulk upload new units from a CSV or Excel file."
            instructions={[
                "Download the template file to see the required format.",
                "Required columns: unit_name, short_name.",
                "Both unit name and short name should be unique.",
            ]}
            onDownloadTemplate={handleDownloadTemplate}
            templateFilename="units_template.csv"
            permission="products:import_units"
        />
    );
}

export default ImportUnitsPage;