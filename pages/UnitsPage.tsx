import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Unit } from '../types';
import { Link } from 'react-router-dom';

// Modal component for adding/editing units
const UnitFormModal: React.FC<{
    unit: Unit | null;
    units: Unit[];
    onClose: () => void;
    onSave: (data: Unit | Omit<Unit, 'id'>) => void;
}> = ({ unit, units, onClose, onSave }) => {
    const isEditing = !!unit;
    const [formData, setFormData] = useState({
        name: unit?.name || '',
        shortName: unit?.shortName || '',
    });
    const [errors, setErrors] = useState<{ name?: string; shortName?: string }>({});

    const validate = () => {
        const newErrors: { name?: string; shortName?: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Unit name is required.';
        if (!formData.shortName.trim()) newErrors.shortName = 'Short name is required.';

        if (units.some(u => u.name.toLowerCase() === formData.name.trim().toLowerCase() && u.id !== unit?.id)) {
            newErrors.name = 'A unit with this name already exists.';
        }
        if (units.some(u => u.shortName.toLowerCase() === formData.shortName.trim().toLowerCase() && u.id !== unit?.id)) {
            newErrors.shortName = 'A unit with this short name already exists.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(isEditing ? { ...unit!, ...formData } : formData);
        }
    };

    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
    const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">{isEditing ? 'Edit Unit' : 'Add New Unit'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Unit Name*</label>
                            <input type="text" id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`} />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="shortName" className="block text-sm font-medium">Short Name*</label>
                            <input type="text" id="shortName" value={formData.shortName} onChange={e => setFormData(p => ({ ...p, shortName: e.target.value }))} className={`${baseInputClasses} ${errors.shortName ? errorInputClasses : ''}`} />
                            {errors.shortName && <p className="mt-1 text-sm text-red-600">{errors.shortName}</p>}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Unit'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const UnitsPage: React.FC = () => {
    const { units, addUnit, updateUnit, deleteUnit, hasPermission } = useAuth();
    const canManage = hasPermission('products:units');
    const canImport = hasPermission('products:import_units');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const handleOpenModal = (unit: Unit | null) => {
        setEditingUnit(unit);
        setIsModalOpen(true);
    };

    const handleSave = (data: Unit | Omit<Unit, 'id'>) => {
        if ('id' in data) {
            updateUnit(data);
        } else {
            addUnit(data);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (unitId: string) => {
        if (window.confirm("Are you sure you want to delete this unit?")) {
            try {
                deleteUnit(unitId);
            } catch (error: any) {
                setApiError(error.message);
            }
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Units</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage product units.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link 
                                to="/products/units/import" 
                                className={`bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold whitespace-nowrap ${!canImport ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={(e) => !canImport && e.preventDefault()}
                                aria-disabled={!canImport}
                                title={!canImport ? "You don't have permission to import units" : "Import units from a file"}
                            >
                                Import Units
                            </Link>
                            <button 
                                onClick={() => handleOpenModal(null)} 
                                disabled={!canManage} 
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                Add Unit
                            </button>
                        </div>
                    </div>
                </div>
                 {apiError && <div className="p-4 m-6 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">{apiError} <button onClick={() => setApiError(null)} className="font-bold ml-4">X</button></div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Unit Name</th>
                                <th scope="col" className="px-6 py-3">Short Name</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.map(unit => (
                                <tr key={unit.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{unit.name}</td>
                                    <td className="px-6 py-4">{unit.shortName}</td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(unit)} disabled={!canManage} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Edit</button>
                                        <button onClick={() => handleDelete(unit.id)} disabled={!canManage} className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <UnitFormModal unit={editingUnit} units={units} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </>
    );
};

export default UnitsPage;
