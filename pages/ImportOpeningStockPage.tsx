

// FIX: Corrected the React import statement.
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { downloadCSV } from '../utils';

const ImportFilePage: React.FC<{
    title: string;
    description: string;
    instructions: string[];
    onDownloadTemplate: () => void;
    templateFilename: string;
    permission: 'products:import' | 'products:import_stock';
}> = ({ title, description, instructions, onDownloadTemplate, templateFilename, permission }) => {
    const { hasPermission } = useAuth();
    const [file, setFile] = React.useState<File | null>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    if (!hasPermission(permission)) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to import stock.
                </p>
            </div>
        );
    }
    
    const handleImport = () => {
        if (!file) {
            alert('Please select a file to import.');
            return;
        }
        alert(`Importing stock from ${file.name}... (This is a placeholder, no data will be changed)`);
    };

    return (
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            </div>
            <div className="p-6 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                    <h3 className="font-semibold text-lg">Instructions</h3>
                    <ol className="list-decimal list-inside mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                    </ol>
                    <button onClick={onDownloadTemplate} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium mt-3 inline-flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Template File ({templateFilename})
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Upload CSV File</label>
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className={`relative block w-full rounded-lg border-2 border-dashed p-12 text-center hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isDragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600'}`}
                    >
                         <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-slate-200">
                           {file ? file.name : 'Drag and drop a file, or click to select'}
                        </span>
                        <input type="file" onChange={handleFileChange} accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>
                 {file && (
                    <div className="text-center">
                        <button 
                            onClick={() => setFile(null)} 
                            className="text-sm text-red-600 dark:text-red-400 hover:underline">
                            Clear selection
                        </button>
                    </div>
                )}
            </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                <button 
                    onClick={handleImport}
                    disabled={!file}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                    Import
                </button>
            </div>
        </div>
    );
};


const ImportOpeningStockPage: React.FC = () => {
    const { products } = useAuth();
    
    const handleDownloadTemplate = () => {
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

    return (
        <ImportFilePage
            title="Import Opening Stock"
            description="Bulk add stock quantities to your products from a CSV file."
            instructions={[
                "Download the template file. It is pre-populated with your existing products.",
                "Required columns: sku, quantity_to_add.",
                "SKUs must match existing products in the system.",
                "The 'quantity_to_add' will be added to the current stock level for each product.",
                "Fill in a 'reason' for each adjustment (e.g., 'Initial stock count', 'Shipment received')."
            ]}
            onDownloadTemplate={handleDownloadTemplate}
            templateFilename="add_stock_template.csv"
            permission="products:import_stock"
        />
    );
}

export default ImportOpeningStockPage;