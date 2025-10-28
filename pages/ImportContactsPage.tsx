
import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
// A basic implementation of useDropzone might look complex, so we'll use a standard file input with dropzone styling.
// import { useDropzone } from 'react-dropzone'; 

const ImportContactsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

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

    if (!hasPermission('contacts:import')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to import contacts.
                </p>
            </div>
        );
    }
    
    const handleImport = () => {
        if (!file) {
            alert('Please select a file to import.');
            return;
        }
        // Placeholder for actual import logic
        alert(`Importing contacts from ${file.name}... (This is a placeholder, no data will be changed)`);
    };

    return (
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">Import Contacts</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Bulk upload customers or suppliers from a CSV file.</p>
            </div>
            <div className="p-6 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                    <h3 className="font-semibold text-lg">Instructions</h3>
                    <ol className="list-decimal list-inside mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>Download the sample CSV file to see the required format.</li>
                        <li>Fill in your contact data, ensuring each column is correct.</li>
                        <li>The 'customerGroupName' must match an existing group name exactly.</li>
                        <li>Upload the completed file below. The system will validate the data before importing.</li>
                    </ol>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Sample file download placeholder.");}} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium mt-2 inline-block">
                        Download Sample CSV
                    </a>
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
                    Import Contacts
                </button>
            </div>
        </div>
    );
};

export default ImportContactsPage;
