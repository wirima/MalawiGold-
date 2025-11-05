import React from 'react';
import { downloadCSV } from '../utils';
import ImportFilePage from '../components/ImportFilePage';

const ImportUnitsPage: React.FC = () => {
    
    const handleDownloadCsv = () => {
        const headers = [
            'unit_name', 'short_name'
        ];
        downloadCSV('units_template.csv', headers);
    };

    const handleDownloadExcel = () => {
        const headers = [
            'unit_name', 'short_name'
        ];
        downloadCSV('units_template.xlsx', headers);
    };

    return (
        <ImportFilePage
            title="Import Units"
            description="Bulk upload new units from a CSV or Excel file."
            instructions={[
                "Download a template file to see the required format.",
                "Required columns: unit_name, short_name.",
                "Both unit name and short name should be unique.",
            ]}
            onDownloadCsv={handleDownloadCsv}
            onDownloadExcel={handleDownloadExcel}
            permission="products:import_units"
        />
    );
}

export default ImportUnitsPage;