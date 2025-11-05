import React from 'react';
import { downloadCSV } from '../utils';
import ImportFilePage from '../components/ImportFilePage';


const ImportProductsPage: React.FC = () => {
    
    const headers = [
        'product_name', 'sku', 'category_name', 'brand_name', 'unit_name', 
        'location_name', 'cost_price', 'selling_price', 'initial_stock', 
        'reorder_point', 'is_not_for_sale'
    ];

    const handleDownloadCsv = () => {
        downloadCSV('products_template.csv', headers);
    };
    
    const handleDownloadExcel = () => {
        downloadCSV('products_template.xlsx', headers);
    };

    return (
        <ImportFilePage
            title="Import Products"
            description="Bulk upload new products from a CSV file."
            instructions={[
                "Download a template file to see the required format.",
                "Required columns: product_name, sku, category_name, unit_name, location_name, cost_price, selling_price.",
                "SKUs must be unique per business location.",
                "Category, Brand, Unit, and Location names must exactly match existing values in the system.",
                "Optional columns will use default values if left blank."
            ]}
            onDownloadCsv={handleDownloadCsv}
            onDownloadExcel={handleDownloadExcel}
            permission="products:import"
        />
    );
}

export default ImportProductsPage;