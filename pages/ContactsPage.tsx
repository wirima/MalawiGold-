import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Customer, Supplier, CustomerGroup } from '../types';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'customers' | 'suppliers' | 'groups';

// Reusable base input classes for forms
const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

// #region Modals
const CustomerFormModal: React.FC<{
    customer: Customer | null;
    customers: Customer[];
    suppliers: Supplier[];
    customerGroups: CustomerGroup[];
    onClose: () => void;
    onSave: (customerData: Customer | Omit<Customer, 'id'>) => void;
}> = ({ customer, customers, suppliers, customerGroups, onClose, onSave }) => {
    const isEditing = !!customer;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        customerGroupId: customerGroups[0]?.id || ''
    });
    const [errors, setErrors] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                customerGroupId: customer.customerGroupId
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                customerGroupId: customerGroups[0]?.id || ''
            });
        }
        setErrors({ name: '', email: '', phone: '' });
    }, [customer, customerGroups]);


    const validate = () => {
        const newErrors = { name: '', email: '', phone: '' };
        let isValid = true;
        const trimmedName = formData.name.trim();
        const trimmedEmail = formData.email.trim().toLowerCase();
        const trimmedPhone = formData.phone.trim();

        if (!trimmedName) {
            newErrors.name = 'Customer name is required.';
            isValid = false;
        } else if (customers.some(c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== customer?.id) || suppliers.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
            newErrors.name = 'A contact with this name already exists.';
            isValid = false;
        }

        if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            newErrors.email = 'Please enter a valid email address.';
            isValid = false;
        } else if (trimmedEmail && (customers.some(c => c.email.toLowerCase() === trimmedEmail && c.id !== customer?.id) || suppliers.some(s => s.email.toLowerCase() === trimmedEmail))) {
            newErrors.email = 'This email is already in use by another contact.';
            isValid = false;
        }

        if (trimmedPhone && (customers.some(c => c.phone === trimmedPhone && c.id !== customer?.id) || suppliers.some(s => s.phone === trimmedPhone))) {
            newErrors.phone = 'This phone number is already in use by another contact.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(isEditing ? { ...customer, ...formData } : formData);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name*</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`} />
                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`${baseInputClasses} ${errors.email ? errorInputClasses : ''}`} />
                            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`${baseInputClasses} ${errors.phone ? errorInputClasses : ''}`} />
                            {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                        </div>
                        <div>
                            <label htmlFor="customerGroupId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Customer Group</label>
                            <select id="customerGroupId" name="customerGroupId" value={formData.customerGroupId} onChange={handleChange} className={baseInputClasses}>
                                {customerGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                            <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} className={baseInputClasses} />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Customer'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SupplierFormModal: React.FC<{
    supplier: Supplier | null;
    suppliers: Supplier[];
    customers: Customer[];
    onClose: () => void;
    onSave: (supplierData: Supplier | Omit<Supplier, 'id'>) => void;
}> = ({ supplier, suppliers, customers, onClose, onSave }) => {
    const isEditing = !!supplier;
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        // This effect ensures the form is always populated with the correct data for editing,
        // or reset to a clean state for adding. It also resets errors.
        if (supplier) { // Editing existing supplier
            setFormData({
                name: supplier.name,
                companyName: supplier.companyName,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address
            });
        } else { // Adding a new supplier
             setFormData({
                name: '',
                companyName: '',
                email: '',
                phone: '',
                address: ''
            });
        }
        setErrors({ name: '', email: '', phone: '' });
    }, [supplier]);

    const validate = () => {
        const newErrors = { name: '', email: '', phone: '' };
        let isValid = true;
        const trimmedName = formData.name.trim();
        const trimmedEmail = formData.email.trim().toLowerCase();
        const trimmedPhone = formData.phone.trim();

        if (!trimmedName) {
            newErrors.name = 'Contact name is required.';
            isValid = false;
        } else if (suppliers.some(s => s.name.toLowerCase() === trimmedName.toLowerCase() && s.id !== supplier?.id) || customers.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
            newErrors.name = 'A contact with this name already exists.';
            isValid = false;
        }

        if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            newErrors.email = 'Please enter a valid email address.';
            isValid = false;
        } else if (trimmedEmail && (suppliers.some(s => s.email.toLowerCase() === trimmedEmail && s.id !== supplier?.id) || customers.some(c => c.email.toLowerCase() === trimmedEmail))) {
            newErrors.email = 'This email is already in use by another contact.';
            isValid = false;
        }
        
        if (trimmedPhone && (suppliers.some(s => s.phone === trimmedPhone && s.id !== supplier?.id) || customers.some(c => c.phone === trimmedPhone))) {
            newErrors.phone = 'This phone number is already in use by another contact.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(isEditing ? { ...supplier, ...formData } : formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-bold">{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</h2></div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Contact Name*</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`} />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium">Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={baseInputClasses} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${baseInputClasses} ${errors.email ? errorInputClasses : ''}`} />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`${baseInputClasses} ${errors.phone ? errorInputClasses : ''}`} />
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium">Address</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={baseInputClasses} />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Supplier'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CustomerGroupFormModal: React.FC<{
    group: CustomerGroup | null;
    onClose: () => void;
    onSave: (groupData: CustomerGroup | Omit<CustomerGroup, 'id'>) => void;
}> = ({ group, onClose, onSave }) => {
    const isEditing = !!group;
    const [formData, setFormData] = useState({
        name: '',
        discountPercentage: 0,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (group) {
            setFormData({
                name: group.name,
                discountPercentage: group.discountPercentage
            });
        } else {
            setFormData({
                name: '',
                discountPercentage: 0
            });
        }
    }, [group]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Group name is required.');
            return;
        }
        setError('');
        onSave(isEditing ? { ...group, ...formData } : formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700"><h2 className="text-xl font-bold">{isEditing ? 'Edit Customer Group' : 'Add New Group'}</h2></div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Group Name*</label>
                            <input type="text" id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={`${baseInputClasses} ${error ? errorInputClasses : ''}`} />
                            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                        </div>
                        <div>
                            <label htmlFor="discountPercentage" className="block text-sm font-medium">Discount Percentage</label>
                            <input type="number" id="discountPercentage" value={formData.discountPercentage} onChange={e => setFormData(p => ({ ...p, discountPercentage: Number(e.target.value) }))} className={baseInputClasses} />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Group'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// #endregion

const ContactsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('customers');
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState< 'customer' | 'supplier' | 'group' | null >(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const { 
        customers, customerGroups, suppliers, 
        addCustomer, updateCustomer, deleteCustomer,
        addSupplier, updateSupplier, deleteSupplier,
        addCustomerGroup, updateCustomerGroup, deleteCustomerGroup,
        hasPermission 
    } = useAuth();
    
    const canManageContacts = hasPermission('contacts:manage');
    const canImportContacts = hasPermission('contacts:import');

    const customerGroupsMap = useMemo(() => {
        const map = new Map<string, string>();
        customerGroups.forEach(group => map.set(group.id, group.name));
        return map;
    }, [customerGroups]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        );
    }, [customers, searchTerm]);
    
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);
    
    // #region Handlers
    const handleCloseModal = () => {
        setModal(null);
        setEditingCustomer(null);
        setEditingSupplier(null);
        setEditingGroup(null);
    };

    const handleSaveCustomer = (data: Customer | Omit<Customer, 'id'>) => {
        if ('id' in data) {
            updateCustomer(data);
        } else {
            addCustomer(data);
        }
        handleCloseModal();
    };

    const handleSaveSupplier = (data: Supplier | Omit<Supplier, 'id'>) => {
        if ('id' in data) {
            updateSupplier(data);
        } else {
            addSupplier(data);
        }
        handleCloseModal();
    };

    const handleSaveGroup = (data: CustomerGroup | Omit<CustomerGroup, 'id'>) => {
        if ('id' in data) {
            updateCustomerGroup(data);
        } else {
            addCustomerGroup(data);
        }
        handleCloseModal();
    };
    
    const handleDeleteCustomer = (customer: Customer) => {
        setConfirmationState({
            isOpen: true,
            title: 'Delete Customer',
            message: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
            onConfirm: () => {
                deleteCustomer(customer.id);
                setConfirmationState(null);
            }
        });
    };

    const handleDeleteSupplier = (supplier: Supplier) => {
        setConfirmationState({
            isOpen: true,
            title: 'Delete Supplier',
            message: `Are you sure you want to delete ${supplier.name}? This action cannot be undone.`,
            onConfirm: () => {
                try {
                    deleteSupplier(supplier.id);
                } catch (error: any) {
                    setApiError(error.message);
                }
                setConfirmationState(null);
            }
        });
    };
    
    const handleDeleteGroup = (group: CustomerGroup) => {
         setConfirmationState({
            isOpen: true,
            title: 'Delete Customer Group',
            message: `Are you sure you want to delete the group "${group.name}"?`,
            onConfirm: () => {
                try {
                    deleteCustomerGroup(group.id);
                } catch (error: any) {
                    setApiError(error.message);
                }
                setConfirmationState(null);
            }
        });
    };
    // #endregion
    
    const ApiErrorMessage = ({ message, onClose }: { message: string; onClose: () => void; }) => (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{message}</span>
            <button onClick={onClose} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
        </div>
    );

    // #region Table Renders
    const actionButtons = (onEdit: () => void, onDelete: () => void) => (
        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
            <button onClick={onEdit} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed" disabled={!canManageContacts}>Edit</button>
            <button onClick={onDelete} className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed" disabled={!canManageContacts}>Delete</button>
        </td>
    );

    const renderCustomersTable = () => (
        <Table<Customer>
            headers={['Name', 'Email', 'Phone', 'Customer Group', 'Actions']}
            data={filteredCustomers}
            renderRow={(customer) => (
                <>
                    <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{customer.name}</td>
                    <td className="px-6 py-4">{customer.email}</td>
                    <td className="px-6 py-4">{customer.phone}</td>
                    <td className="px-6 py-4">{customerGroupsMap.get(customer.customerGroupId) || 'N/A'}</td>
                    {actionButtons(() => { setEditingCustomer(customer); setModal('customer'); }, () => handleDeleteCustomer(customer))}
                </>
            )}
        />
    );

    const renderSuppliersTable = () => (
        <Table<Supplier>
            headers={['Contact Name', 'Company Name', 'Email', 'Phone', 'Actions']}
            data={filteredSuppliers}
            renderRow={(supplier) => (
                <>
                    <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{supplier.name}</td>
                    <td className="px-6 py-4">{supplier.companyName}</td>
                    <td className="px-6 py-4">{supplier.email}</td>
                    <td className="px-6 py-4">{supplier.phone}</td>
                    {actionButtons(() => { setEditingSupplier(supplier); setModal('supplier'); }, () => handleDeleteSupplier(supplier))}
                </>
            )}
        />
    );
    
    const renderGroupsTable = () => (
        <Table<CustomerGroup>
            headers={['Group Name', 'Discount %', 'Actions']}
            data={customerGroups}
            renderRow={(group) => (
                <>
                    <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{group.name}</td>
                    <td className="px-6 py-4">{group.discountPercentage}%</td>
                    {actionButtons(() => { setEditingGroup(group); setModal('group'); }, () => handleDeleteGroup(group))}
                </>
            )}
        />
    );
    // #endregion

    const TABS: { id: Tab; label: string; content: React.ReactNode; placeholder: string; addLabel: string; onAdd: () => void; }[] = [
        { id: 'customers', label: `Customers (${customers.length})`, content: renderCustomersTable(), placeholder: 'Search customers...', addLabel: 'Add Customer', onAdd: () => setModal('customer') },
        { id: 'suppliers', label: `Suppliers (${suppliers.length})`, content: renderSuppliersTable(), placeholder: 'Search suppliers...', addLabel: 'Add Supplier', onAdd: () => setModal('supplier') },
        { id: 'groups', label: `Customer Groups (${customerGroups.length})`, content: renderGroupsTable(), placeholder: 'Search groups...', addLabel: 'Add Group', onAdd: () => setModal('group') }
    ];

    const activeTabData = TABS.find(tab => tab.id === activeTab);
    
    const importButtonClasses = "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold whitespace-nowrap";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                 {apiError && <div className="mb-4"><ApiErrorMessage message={apiError} onClose={() => setApiError(null)} /></div>}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Contacts</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your customers, suppliers, and groups.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Link to="/contacts/import" className={`${importButtonClasses} ${!canImportContacts ? 'opacity-50 cursor-not-allowed' : ''}`} aria-disabled={!canImportContacts} onClick={(e) => !canImportContacts && e.preventDefault()}>
                            Import Contacts
                        </Link>
                         <button
                            onClick={activeTabData?.onAdd}
                            disabled={!canManageContacts} 
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            {activeTabData?.addLabel || 'Add New'}
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
                 <div className="mt-4">
                    <input 
                        type="text" 
                        placeholder={activeTabData?.placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                {activeTabData?.content}
            </div>
            
            {modal === 'customer' && <CustomerFormModal customer={editingCustomer} customers={customers} suppliers={suppliers} customerGroups={customerGroups} onClose={handleCloseModal} onSave={handleSaveCustomer} />}
            {modal === 'supplier' && <SupplierFormModal supplier={editingSupplier} suppliers={suppliers} customers={customers} onClose={handleCloseModal} onSave={handleSaveSupplier} />}
            {modal === 'group' && <CustomerGroupFormModal group={editingGroup} onClose={handleCloseModal} onSave={handleSaveGroup} />}
            {confirmationState && <ConfirmationModal 
                isOpen={confirmationState.isOpen}
                title={confirmationState.title}
                message={confirmationState.message}
                onClose={() => setConfirmationState(null)}
                onConfirm={confirmationState.onConfirm}
            />}
        </div>
    );
};

interface TableProps<T> {
    headers: string[];
    data: T[];
    renderRow: (item: T) => React.ReactNode;
}

const Table = <T extends {id: string},>({ headers, data, renderRow }: TableProps<T>) => (
    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
            <tr>
                {headers.map(header => (
                    <th key={header} scope="col" className="px-6 py-3">{header}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {data.length > 0 ? data.map(item => (
                <tr key={item.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                    {renderRow(item)}
                </tr>
            )) : (
                <tr>
                    <td colSpan={headers.length} className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No entries found.
                    </td>
                </tr>
            )}
        </tbody>
    </table>
);

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
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
};

export default ContactsPage;