import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { downloadCSV } from '../utils';
import ImportFilePage from '../components/ImportFilePage';


const ImportOpeningStockPage: React.FC = () => {
    const { products } = useAuth();
    
    const handleDownloadCsv = () => {
        const headers = ['sku', 'product_name', 'current_stock', 'quantity_to_add', 'reason'];
        const data = products.map(p => [
            p.sku,
            p.name,
            p.stock,
            '', // Placeholder for quantity
            'Initial stock' // Default reason
        ]);
        downloadCSV('add_stock_template.csv', headers, data);
    };

    const handleDownloadExcel = () => {
        const headers = ['sku', 'product_name', 'current_stock', 'quantity_to_add', 'reason'];
        const data = products.map(p => [
            p.sku,
            p.name,
            p.stock,
            '', // Placeholder for quantity
            'Initial stock' // Default reason
        ]);
        downloadCSV('add_stock_template.xlsx', headers, data);
    };

    return (
        <ImportFilePage
            title="Import Opening Stock"
            description="Bulk add stock quantities to your products from a CSV file."
            instructions={[
                "Download a template file. It is pre-populated with your existing products.",
                "Required columns: sku, quantity_to_add.",
                "SKUs must match existing products in the system.",
                "The 'quantity_to_add' will be added to the current stock level for each product.",
                "Fill in a 'reason' for each adjustment (e.g., 'Initial stock count', 'Shipment received')."
            ]}
            onDownloadCsv={handleDownloadCsv}
            onDownloadExcel={handleDownloadExcel}
            permission="products:import_stock"
        />
    );
}

export default ImportOpeningStockPage;