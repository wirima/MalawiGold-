import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProductDocument, Product } from '../types';

// Modal component
const DocumentFormModal: React.FC<{
    doc: ProductDocument | null;
    products: Product[];
    onClose: () => void;
    onSave: (data: ProductDocument | Omit<ProductDocument, 'id'>) => void;
}> = ({ doc, products, onClose, onSave }) => {
    const isEditing = !!doc;
    const [name, setName] = useState(doc?.name || '');
    const [description, setDescription] = useState(doc?.description || '');
    const [fileType, setFileType] = useState<'coa' | 'warranty'>(doc?.fileType || 'coa');
    const [fileUrl, setFileUrl] = useState<string | null>(doc?.fileUrl || null);
    const [fileName, setFileName] = useState<string | null>(doc?.fileName || null);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set(doc?.productIds || []));
    const [error, setError] = useState('');


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are allowed.');
                return;
            }
            setError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileUrl(reader.result as string);
                setFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProductToggle = (productId: string) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Document name is required.');
            return;
        }
        if (!fileUrl) {
            setError('A PDF file must be uploaded.');
            return;
        }
        setError('');
        
        const docData = {
            name,
            description,
            productIds: Array.from(selectedProductIds),
            fileUrl,
            fileName: fileName || 'document.pdf',
            fileType,
        };
        onSave(isEditing ? { ...doc!, ...docData } : docData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">{isEditing ? 'Edit Document' : 'Add New Document'}</h2>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Document Name*</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Document Type*</label>
                                <select value={fileType} onChange={e => setFileType(e.target.value as 'coa' | 'warranty')} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="coa">Certificate of Analysis (COA)</option>
                                    <option value="warranty">Warranty</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Upload PDF*</label>
                             <div className="mt-1">
                                <input type="file" onChange={handleFileChange} accept="application/pdf" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900" />
                                {fileName && <p className="mt-2 text-sm text-slate-500">Selected file: {fileName}</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-medium">Associated Products</h3>
                            <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto p-2 dark:border-slate-600">
                                {products.map(product => (
                                    <div key={product.id} className="flex items-center p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">
                                        <input
                                            type="checkbox"
                                            id={`product-${product.id}`}
                                            checked={selectedProductIds.has(product.id)}
                                            onChange={() => handleProductToggle(product.id)}
                                            className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`product-${product.id}`} className="ml-3 text-sm">{product.name} <span className="text-xs text-slate-500">({product.sku})</span></label>
                                    </div>
                                ))}
                            </div>
                        </div>
                         {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Document'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main page component
const ProductDocumentsPage: React.FC = () => {
    const { productDocuments, products, addProductDocument, updateProductDocument, deleteProductDocument, hasPermission } = useAuth();
    const canManage = hasPermission('products:documents');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<ProductDocument | null>(null);

    const handleSave = (data: ProductDocument | Omit<ProductDocument, 'id'>) => {
        if ('id' in data) {
            updateProductDocument(data);
        } else {
            addProductDocument(data);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (docId: string) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            deleteProductDocument(docId);
        }
    };

    if (!canManage) {
        return <div className="text-center p-8">Access Denied.</div>;
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Product Documents</h1>
                        <p className="text-slate-500 mt-1">Manage warranties, certificates of analysis, and other documents.</p>
                    </div>
                    <button onClick={() => { setEditingDoc(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold">
                        Add Document
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th className="px-6 py-3">Document Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">File</th>
                                <th className="px-6 py-3">Associated Products</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productDocuments.map(doc => (
                                <tr key={doc.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{doc.name}</div>
                                        <div className="text-xs text-slate-500">{doc.description}</div>
                                    </td>
                                     <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            doc.fileType === 'coa' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                        }`}>
                                            {doc.fileType.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
                                            {doc.fileName}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">{doc.productIds.length}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => { setEditingDoc(doc); setIsModalOpen(true); }} className="font-medium text-indigo-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(doc.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <DocumentFormModal
                    doc={editingDoc}
                    products={products}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default ProductDocumentsPage;