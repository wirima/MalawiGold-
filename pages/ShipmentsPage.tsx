
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shipment, Sale } from '../types';

type ShipmentStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
const STATUS_OPTIONS: ShipmentStatus[] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

// #region Modals
const ShipmentFormModal: React.FC<{
    shipment: Shipment | null;
    sales: Sale[];
    onClose: () => void;
    onSave: (data: Shipment | Omit<Shipment, 'id'>) => void;
}> = ({ shipment, sales, onClose, onSave }) => {
    const isEditing = !!shipment;
    const [formData, setFormData] = useState({
        saleId: shipment?.saleId || '',
        customerName: shipment?.customerName || '',
        shippingAddress: shipment?.shippingAddress || '',
        trackingNumber: shipment?.trackingNumber || '',
        status: shipment?.status || 'Processing'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (shipment) {
            setFormData({
                saleId: shipment.saleId,
                customerName: shipment.customerName,
                shippingAddress: shipment.shippingAddress,
                trackingNumber: shipment.trackingNumber,
                status: shipment.status
            });
        }
    }, [shipment]);
    
    useEffect(() => {
        const selectedSale = sales.find(s => s.id === formData.saleId);
        if (selectedSale) {
            setFormData(prev => ({ ...prev, customerName: selectedSale.customer.name }));
        }
    }, [formData.saleId, sales]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.saleId) newErrors.saleId = "A sale must be selected.";
        if (!formData.shippingAddress.trim()) newErrors.shippingAddress = "Shipping address is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(isEditing ? { ...shipment!, ...formData } : formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
    const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";


    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-bold">{isEditing ? 'Edit Shipment' : 'Add New Shipment'}</h2></div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label htmlFor="saleId" className="block text-sm font-medium">Sale ID*</label>
                            <select id="saleId" name="saleId" value={formData.saleId} onChange={handleChange} className={`${baseInputClasses} ${errors.saleId ? errorInputClasses : ''}`} disabled={isEditing}>
                                <option value="" disabled>Select a sale</option>
                                {sales.map(s => <option key={s.id} value={s.id}>{s.id} - {s.customer.name}</option>)}
                            </select>
                             {errors.saleId && <p className="mt-1 text-sm text-red-600">{errors.saleId}</p>}
                        </div>
                         <div>
                            <label htmlFor="customerName" className="block text-sm font-medium">Customer Name</label>
                            <input type="text" id="customerName" name="customerName" value={formData.customerName} readOnly className={`${baseInputClasses} opacity-70 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label htmlFor="shippingAddress" className="block text-sm font-medium">Shipping Address*</label>
                            <textarea id="shippingAddress" name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} rows={3} className={`${baseInputClasses} ${errors.shippingAddress ? errorInputClasses : ''}`} />
                            {errors.shippingAddress && <p className="mt-1 text-sm text-red-600">{errors.shippingAddress}</p>}
                        </div>
                        <div>
                            <label htmlFor="trackingNumber" className="block text-sm font-medium">Tracking Number</label>
                            <input type="text" id="trackingNumber" name="trackingNumber" value={formData.trackingNumber} onChange={handleChange} className={baseInputClasses} />
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className={baseInputClasses}>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Shipment'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// #endregion

const ShipmentsPage: React.FC = () => {
    const { shipments, sales, hasPermission, addShipment, updateShipment, deleteShipment } = useAuth();
    const canManage = hasPermission('shipping:manage');
    const canView = hasPermission('shipping:view');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

    const handleOpenModal = (shipment: Shipment | null) => {
        setEditingShipment(shipment);
        setIsModalOpen(true);
    };

    const handleSave = (data: Shipment | Omit<Shipment, 'id'>) => {
        if ('id' in data) {
            updateShipment(data);
        } else {
            addShipment(data);
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = (shipment: Shipment) => {
        if(window.confirm(`Are you sure you want to delete the shipment for sale ${shipment.saleId}?`)) {
            deleteShipment(shipment.id);
        }
    };

    if (!canView) {
        return <div className="text-center p-8">Access Denied. You don't have permission to view shipments.</div>;
    }
    
    const getStatusClass = (status: ShipmentStatus) => {
        switch (status) {
            case 'Shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Processing':
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        }
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Shipments</h1>
                        <p className="text-slate-500 mt-1">Manage shipping details for your sales.</p>
                    </div>
                    <button onClick={() => handleOpenModal(null)} disabled={!canManage} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        Add Shipment
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Sale ID</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Tracking #</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipments.map(ship => (
                                <tr key={ship.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{ship.saleId}</td>
                                    <td className="px-6 py-4">{ship.customerName}</td>
                                    <td className="px-6 py-4 font-mono">{ship.trackingNumber || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ship.status)}`}>
                                            {ship.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleOpenModal(ship)} disabled={!canManage} className="font-medium text-indigo-600 hover:underline disabled:text-slate-400">Edit</button>
                                        <button onClick={() => handleDelete(ship)} disabled={!canManage} className="font-medium text-red-600 hover:underline disabled:text-slate-400">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <ShipmentFormModal shipment={editingShipment} sales={sales} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </>
    );
};

export default ShipmentsPage;
