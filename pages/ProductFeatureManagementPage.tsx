import React, { useState } from 'react';

interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea';
    required?: boolean;
}

interface Item {
    id: string;
    [key: string]: any;
}

// Modal Component
const FeatureFormModal: React.FC<{
    item: Item | null;
    fields: FormField[];
    onClose: () => void;
    onSave: (data: any) => void;
    itemDisplayName: string;
}> = ({ item, fields, onClose, onSave, itemDisplayName }) => {
    const isEditing = !!item;
    const initialFormState = fields.reduce((acc, field) => {
        acc[field.name] = item?.[field.name] ?? (field.type === 'number' ? 0 : '');
        return acc;
    }, {} as Record<string, any>);
    
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;
        fields.forEach(field => {
            if (field.required && !String(formData[field.name]).trim()) {
                newErrors[field.name] = `${field.label} is required.`;
                isValid = false;
            }
        });
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(isEditing ? { ...item, ...formData } : formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };
    
    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
    const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold capitalize">{isEditing ? `Edit ${itemDisplayName}` : `Add New ${itemDisplayName}`}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {fields.map(field => (
                            <div key={field.name}>
                                <label htmlFor={field.name} className="block text-sm font-medium">{field.label}{field.required ? '*' : ''}</label>
                                <input
                                    type={field.type}
                                    id={field.name}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    className={`${baseInputClasses} ${errors[field.name] ? errorInputClasses : ''}`}
                                />
                                {errors[field.name] && <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : `Add ${itemDisplayName}`}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Main Page Component
interface ProductFeatureManagementPageProps {
    title: string;
    items: Item[];
    onAddItem: (data: Omit<Item, 'id'>) => void;
    onUpdateItem: (item: Item) => void;
    onDeleteItem: (itemId: string) => void;
    canManage: boolean;
    itemDisplayName: string;
    formFields: FormField[];
    tableHeaders: string[];
    renderRow: (item: Item) => React.ReactNode;
}

const ProductFeatureManagementPage: React.FC<ProductFeatureManagementPageProps> = ({
    title, items, onAddItem, onUpdateItem, onDeleteItem, canManage, itemDisplayName, formFields, tableHeaders, renderRow
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const handleOpenModal = (item: Item | null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = (data: any) => {
        if (data.id) {
            onUpdateItem(data);
        } else {
            onAddItem(data);
        }
        handleCloseModal();
    };

    const handleDelete = (itemId: string) => {
        if (window.confirm(`Are you sure you want to delete this ${itemDisplayName}?`)) {
            try {
                onDeleteItem(itemId);
            } catch (error: any) {
                setApiError(error.message);
            }
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <p className="text-slate-500 mt-1">Manage all your product {title.toLowerCase()}.</p>
                    </div>
                    <button onClick={() => handleOpenModal(null)} disabled={!canManage} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed capitalize">
                        Add {itemDisplayName}
                    </button>
                </div>
                 {apiError && <div className="p-4 m-6 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">{apiError} <button onClick={() => setApiError(null)} className="font-bold ml-4">X</button></div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                {tableHeaders.map(header => <th key={header} scope="col" className="px-6 py-3">{header}</th>)}
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map(item => (
                                <tr key={item.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    {renderRow(item)}
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(item)} disabled={!canManage} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} disabled={!canManage} className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={tableHeaders.length + 1} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No {title.toLowerCase()} found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <FeatureFormModal
                    item={editingItem}
                    fields={formFields}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    itemDisplayName={itemDisplayName}
                />
            )}
        </>
    );
};

export default ProductFeatureManagementPage;