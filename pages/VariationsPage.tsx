import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Variation, VariationValue } from '../types';

// #region Modals
const VariationTemplateModal: React.FC<{
    variation: Variation | null;
    onClose: () => void;
    onSave: (data: Variation | Omit<Variation, 'id'>) => void;
}> = ({ variation, onClose, onSave }) => {
    const isEditing = !!variation;
    const [name, setName] = useState(variation?.name || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Variation name is required.');
            return;
        }
        onSave(isEditing ? { ...variation, name } : { name });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">{isEditing ? 'Edit Variation' : 'Add New Variation'}</h2>
                    </div>
                    <div className="p-6">
                        <label htmlFor="name" className="block text-sm font-medium">Variation Name (e.g., Size, Color)</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            className={`mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 ${error ? 'border-red-500' : ''}`}
                        />
                        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Variation'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const VariationValueModal: React.FC<{
    value: VariationValue | null;
    variationId: string;
    onClose: () => void;
    onSave: (data: VariationValue | Omit<VariationValue, 'id'>) => void;
}> = ({ value, variationId, onClose, onSave }) => {
    const isEditing = !!value;
    const [name, setName] = useState(value?.name || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Value name is required.');
            return;
        }
        onSave(isEditing ? { ...value, name } : { name, variationId });
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">{isEditing ? 'Edit Value' : 'Add New Value'}</h2>
                    </div>
                    <div className="p-6">
                        <label htmlFor="valueName" className="block text-sm font-medium">Value Name (e.g., Small, Red, Cotton)</label>
                        <input
                            type="text"
                            id="valueName"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            className={`mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 ${error ? 'border-red-500' : ''}`}
                        />
                        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Value'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
}> = ({ title, message, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                        </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-white" id="dialog-title">{title}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                    Confirm Delete
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </div>
    </div>
);
// #endregion

const VariationsPage: React.FC = () => {
    const { 
        variations, variationValues, hasPermission, 
        addVariation, updateVariation, deleteVariation,
        addVariationValue, updateVariationValue, deleteVariationValue
    } = useAuth();
    
    const canManage = hasPermission('products:variations');
    const [modal, setModal] = useState<'variation' | 'value' | null>(null);
    const [editingVariation, setEditingVariation] = useState<Variation | null>(null);
    const [editingValue, setEditingValue] = useState<VariationValue | null>(null);
    const [activeVariationId, setActiveVariationId] = useState<string | null>(null); // For adding a new value
    const [confirmState, setConfirmState] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const valuesByVariationId = useMemo(() => {
        return variationValues.reduce((acc, value) => {
            if (!acc[value.variationId]) {
                acc[value.variationId] = [];
            }
            acc[value.variationId].push(value);
            return acc;
        }, {} as Record<string, VariationValue[]>);
    }, [variationValues]);

    // #region Handlers
    const handleClose = () => {
        setModal(null);
        setEditingVariation(null);
        setEditingValue(null);
        setActiveVariationId(null);
    };

    const handleAddNewVariation = () => {
        setEditingVariation(null);
        setModal('variation');
    };

    const handleEditVariation = (variation: Variation) => {
        setEditingVariation(variation);
        setModal('variation');
    };

    const handleSaveVariation = (data: Variation | Omit<Variation, 'id'>) => {
        if ('id' in data) {
            updateVariation(data);
        } else {
            addVariation(data);
        }
        handleClose();
    };

    const handleDeleteVariation = (variation: Variation) => {
        setConfirmState({
            title: 'Delete Variation',
            message: `Are you sure you want to delete "${variation.name}"? This action cannot be undone.`,
            onConfirm: () => {
                try {
                    deleteVariation(variation.id);
                } catch (error: any) {
                    setApiError(error.message);
                }
                setConfirmState(null);
            }
        });
    };
    
    const handleAddNewValue = (variationId: string) => {
        setActiveVariationId(variationId);
        setEditingValue(null);
        setModal('value');
    };
    
    const handleEditValue = (value: VariationValue) => {
        setEditingValue(value);
        setActiveVariationId(value.variationId);
        setModal('value');
    };

    const handleSaveValue = (data: VariationValue | Omit<VariationValue, 'id'>) => {
        if ('id' in data) {
            updateVariationValue(data);
        } else {
            addVariationValue(data);
        }
        handleClose();
    };
    
    const handleDeleteValue = (value: VariationValue) => {
        setConfirmState({
            title: 'Delete Value',
            message: `Are you sure you want to delete "${value.name}"?`,
            onConfirm: () => {
                deleteVariationValue(value.id);
                setConfirmState(null);
            }
        });
    };
    // #endregion

    if (!hasPermission('products:variations')) {
        return <div className="text-center p-8">Access Denied. You don't have permission to manage variations.</div>
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Variations</h1>
                        <p className="text-slate-500 mt-1">Manage reusable product attributes like size and color.</p>
                    </div>
                    <button 
                        onClick={handleAddNewVariation} 
                        disabled={!canManage}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        Add Variation
                    </button>
                </div>
                {apiError && <div className="p-4 m-6 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">{apiError} <button onClick={() => setApiError(null)} className="font-bold ml-4">X</button></div>}
                <div className="p-6 space-y-6">
                    {variations.length > 0 ? variations.map(variation => (
                        <div key={variation.id} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 flex justify-between items-center rounded-t-lg">
                                <h3 className="font-bold text-lg">{variation.name}</h3>
                                <div className="space-x-2">
                                    <button onClick={() => handleEditVariation(variation)} disabled={!canManage} className="font-medium text-indigo-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Edit</button>
                                    <button onClick={() => handleDeleteVariation(variation)} disabled={!canManage} className="font-medium text-red-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Delete</button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => handleAddNewValue(variation.id)} disabled={!canManage} className="text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Add Value</button>
                                </div>
                                <div className="space-y-2">
                                    {(valuesByVariationId[variation.id] || []).map(value => (
                                        <div key={value.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <span>{value.name}</span>
                                            <div className="space-x-2 text-sm">
                                                <button onClick={() => handleEditValue(value)} disabled={!canManage} className="font-medium text-indigo-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Edit</button>
                                                <button onClick={() => handleDeleteValue(value)} disabled={!canManage} className="font-medium text-red-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!valuesByVariationId[variation.id] || valuesByVariationId[variation.id].length === 0) && <p className="text-center text-slate-500 text-sm py-4">No values added yet.</p>}
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-center py-10 text-slate-500">No variations created yet. Click "Add Variation" to start.</p>}
                </div>
            </div>

            {modal === 'variation' && <VariationTemplateModal variation={editingVariation} onClose={handleClose} onSave={handleSaveVariation} />}
            {modal === 'value' && activeVariationId && <VariationValueModal value={editingValue} variationId={activeVariationId} onClose={handleClose} onSave={handleSaveValue} />}
            {confirmState && <ConfirmationModal {...confirmState} onClose={() => setConfirmState(null)} />}
        </>
    );
};

export default VariationsPage;