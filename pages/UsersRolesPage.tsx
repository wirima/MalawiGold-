
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Role, Permission } from '../types';
import { ALL_PERMISSIONS } from '../constants';
import ConfirmationModal from '../components/ConfirmationModal';

type Tab = 'users' | 'roles';

// Helper component for displaying a group of permissions
const PermissionGroup: React.FC<{
    groupName: string;
    groupPermissions: Permission[];
    selectedPermissions: Permission[];
    onGroupChange: (groupPermissions: Permission[], checked: boolean) => void;
    onPermissionChange: (permission: Permission, checked: boolean) => void;
}> = ({ groupName, groupPermissions, selectedPermissions, onGroupChange, onPermissionChange }) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    const areAllSelected = useMemo(() => groupPermissions.every(p => selectedPermissions.includes(p)), [groupPermissions, selectedPermissions]);
    const someSelected = useMemo(() => groupPermissions.some(p => selectedPermissions.includes(p)), [groupPermissions, selectedPermissions]);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = someSelected && !areAllSelected;
        }
    }, [someSelected, areAllSelected]);

    return (
        <div className="border dark:border-slate-700 rounded-lg">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-b dark:border-slate-700 rounded-t-lg">
                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id={`group-${groupName}`}
                            type="checkbox"
                            ref={checkboxRef}
                            checked={areAllSelected}
                            onChange={e => onGroupChange(groupPermissions, e.target.checked)}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor={`group-${groupName}`} className="font-bold text-slate-800 dark:text-slate-200 capitalize">{groupName.replace(/_/g, ' ')}</label>
                    </div>
                </div>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupPermissions.map(permission => (
                    <div key={permission} className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id={`permission-${permission}`}
                                type="checkbox"
                                checked={selectedPermissions.includes(permission)}
                                onChange={e => onPermissionChange(permission, e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor={`permission-${permission}`} className="font-medium text-slate-700 dark:text-slate-300 capitalize">{permission.split(':')[1].replace(/_/g, ' ')}</label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Modal component for adding/editing roles
const RoleModal: React.FC<{
    role: Partial<Role>;
    roles: Role[];
    onClose: () => void;
    onSave: (role: Partial<Role>) => void;
}> = ({ role: initialRole, roles, onClose, onSave }) => {
    const [role, setRole] = useState(initialRole);
    const [errors, setErrors] = useState({ name: '' });

    const groupedPermissions = useMemo(() => {
        return ALL_PERMISSIONS.reduce((acc, permission) => {
            const [groupName] = permission.split(':');
            if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(permission);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, []);

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        setRole(prev => {
            if (!prev) return prev;
            const permissions = new Set(prev.permissions || []);
            if (checked) {
                permissions.add(permission);
            } else {
                permissions.delete(permission);
            }
            return { ...prev, permissions: Array.from(permissions) };
        });
    };

    const handleGroupPermissionChange = (groupPermissions: Permission[], checked: boolean) => {
        setRole(prev => {
            if (!prev) return prev;
            const permissions = new Set(prev.permissions || []);
            if (checked) {
                groupPermissions.forEach(p => permissions.add(p));
            } else {
                groupPermissions.forEach(p => permissions.delete(p));
            }
            return { ...prev, permissions: Array.from(permissions) };
        });
    };
    
    const validate = () => {
        const newErrors = { name: '' };
        let isValid = true;
        const trimmedName = role?.name?.trim();

        if (!role || !trimmedName) {
            newErrors.name = 'Role name is required.';
            isValid = false;
        } else if (roles.some(r => r.name.toLowerCase() === trimmedName.toLowerCase() && r.id !== role?.id)) {
            newErrors.name = 'A role with this name already exists.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(role);
        }
    };

    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
    const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full">
                    <div className="p-6 border-b dark:border-slate-700 flex-shrink-0">
                        <h2 className="text-xl font-bold">{role.id ? 'Edit Role' : 'Add New Role'}</h2>
                    </div>

                    <div className="p-6 space-y-4 flex-shrink-0">
                        <div>
                            <label htmlFor="roleName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role Name*</label>
                            <input
                                type="text"
                                id="roleName"
                                value={role.name || ''}
                                onChange={e => {
                                    setRole(prev => prev ? {...prev, name: e.target.value} : null);
                                }}
                                className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="roleDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                            <textarea
                                id="roleDescription"
                                value={role.description || ''}
                                onChange={e => setRole(prev => prev ? {...prev, description: e.target.value} : null)}
                                rows={2}
                                className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="px-6 pb-6 flex-1 overflow-y-auto">
                        <h3 className="text-md font-medium text-slate-900 dark:text-white mb-2">Permissions</h3>
                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                                <PermissionGroup
                                    key={groupName}
                                    groupName={groupName}
                                    groupPermissions={groupPermissions}
                                    selectedPermissions={role.permissions || []}
                                    onGroupChange={handleGroupPermissionChange}
                                    onPermissionChange={handlePermissionChange}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save Role</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal component for adding/editing users
const UserFormModal: React.FC<{
    user: User | null;
    users: User[];
    roles: Role[];
    onClose: () => void;
    onSave: (userData: User | Omit<User, 'id'>) => void;
}> = ({ user, users, roles, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState('');
    const [errors, setErrors] = useState({ name: '', email: '', roleId: '' });
    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRoleId(user.roleId);
        } else {
            setName('');
            setEmail('');
            setRoleId(''); // Force a selection for new users
        }
    }, [user, roles]);

    const validate = () => {
        const newErrors = { name: '', email: '', roleId: '' };
        let isValid = true;
        const trimmedEmail = email.trim().toLowerCase();

        if (!name.trim()) {
            newErrors.name = 'Full Name is required.';
            isValid = false;
        }

        if (!trimmedEmail) {
            newErrors.email = 'Email Address is required.';
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            newErrors.email = 'Please enter a valid email address.';
            isValid = false;
        } else if (users.some(u => u.email.toLowerCase() === trimmedEmail && u.id !== user?.id)) {
            newErrors.email = 'This email address is already in use.';
            isValid = false;
        }
        
        if (!roleId) {
            newErrors.roleId = 'A role must be selected.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const userData = { name, email, roleId };
            if (isEditing && user) {
                onSave({ ...user, ...userData });
            } else {
                onSave(userData);
            }
        }
    };

    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
    const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">{isEditing ? 'Edit User' : 'Add New User'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input 
                                type="text"
                                id="userName"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`}
                                aria-invalid={!!errors.name}
                                aria-describedby="userName-error"
                            />
                             {errors.name && <p id="userName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="userEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <input
                                type="email"
                                id="userEmail"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={`${baseInputClasses} ${errors.email ? errorInputClasses : ''}`}
                                aria-invalid={!!errors.email}
                                aria-describedby="userEmail-error"
                            />
                             {errors.email && <p id="userEmail-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="userRole" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                             <select
                                id="userRole"
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                className={`${baseInputClasses} ${errors.roleId ? errorInputClasses : ''}`}
                                aria-invalid={!!errors.roleId}
                                aria-describedby="userRole-error"
                            >
                                <option value="" disabled>Select a role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                             {errors.roleId && <p id="userRole-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roleId}</p>}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add User'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const UsersRolesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const { users, roles, hasPermission, addRole, updateRole, deleteRole, addUser, updateUser, deleteUser, currentUser } = useAuth();
    const canManageUsers = hasPermission('users:manage');

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Partial<Role> | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const rolesMap = useMemo(() => {
        const map = new Map<string, string>();
        roles.forEach(role => map.set(role.id, role.name));
        return map;
    }, [roles]);

    const handleAddNewRole = () => {
        setSelectedRole({ name: '', description: '', permissions: [] });
        setIsRoleModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const handleDeleteRole = (role: Role) => {
        setConfirmationState({
            isOpen: true,
            title: 'Delete Role',
            message: `Are you sure you want to delete the "${role.name}" role? This action cannot be undone.`,
            onConfirm: () => {
                 try {
                    deleteRole(role.id);
                } catch (error: any) {
                    setApiError(error.message);
                }
                setConfirmationState(null);
            }
        });
    };

    const handleSaveRole = (roleData: Partial<Role>) => {
        if (roleData.id) {
            updateRole(roleData as Role);
        } else {
            addRole(roleData as Omit<Role, 'id'>);
        }
        setIsRoleModalOpen(false);
        setSelectedRole(null);
    };
    
    const handleDeleteUser = (user: User) => {
        setConfirmationState({
            isOpen: true,
            title: 'Delete User',
            message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
            onConfirm: () => {
                try {
                    deleteUser(user.id);
                } catch(error: any) {
                    setApiError(error.message);
                }
                setConfirmationState(null);
            }
        });
    };

    const handleAddNewUser = () => {
        setSelectedUser(null);
        setIsUserFormModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsUserFormModalOpen(true);
    };

    const handleSaveUser = (userData: User | Omit<User, 'id'>) => {
        if ('id' in userData) {
            updateUser(userData);
        } else {
            addUser(userData);
        }
        setIsUserFormModalOpen(false);
    };

    const ApiErrorMessage = ({ message, onClose }: { message: string; onClose: () => void; }) => (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{message}</span>
            <button onClick={onClose} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
        </div>
    );

    const renderUsersTable = () => (
        <Table<User>
            headers={['Name', 'Email', 'Role', 'Actions']}
            data={users}
            renderRow={(user) => (
                <>
                    <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap flex items-center space-x-3">
                        <img src={`https://i.pravatar.cc/100?u=${user.id}`} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
                        <span>{user.name}</span>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.roleId === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            user.roleId === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                           {rolesMap.get(user.roleId) || 'N/A'}
                        </span>
                    </td>
                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                        <button
                            onClick={() => handleEditUser(user)}
                            disabled={!canManageUsers}
                            className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            Edit
                        </button>
                         <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={!canManageUsers || currentUser?.id === user.id}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            Delete
                        </button>
                    </td>
                </>
            )}
        />
    );

    const renderRolesTable = () => (
        <Table<Role>
            headers={['Role', 'Description', 'Permissions', 'Actions']}
            data={roles}
            renderRow={(role) => (
                <>
                    <td scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{role.name}</td>
                    <td className="px-6 py-4 max-w-sm">{role.description}</td>
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                            {role.permissions.map(p => (
                                <span key={p} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs">{p}</span>
                            ))}
                        </div>
                    </td>
                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                        <button 
                            onClick={() => handleEditRole(role)}
                            disabled={!canManageUsers}
                            className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">
                            Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteRole(role)}
                            disabled={!canManageUsers}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">
                            Delete
                        </button>
                    </td>
                </>
            )}
        />
    );


    const TABS = [
        { id: 'users', label: 'Users', content: renderUsersTable() },
        { id: 'roles', label: 'Roles', content: renderRolesTable() }
    ];

    const activeTabData = TABS.find(tab => tab.id === activeTab);

    if (!hasPermission('users:view')) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to view this page.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                {apiError && <div className="mb-4"><ApiErrorMessage message={apiError} onClose={() => setApiError(null)} /></div>}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage users and their roles in the system.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={handleAddNewRole}
                            disabled={!canManageUsers}
                            className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                            Add Role
                        </button>
                        <button
                            onClick={handleAddNewUser}
                            disabled={!canManageUsers}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            Add User
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
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
            </div>
            
            <div className="overflow-x-auto">
                {activeTabData?.content}
            </div>
            
            {isRoleModalOpen && selectedRole && (
                <RoleModal 
                    role={selectedRole}
                    roles={roles}
                    onClose={() => setIsRoleModalOpen(false)}
                    onSave={handleSaveRole}
                />
            )}
            {isUserFormModalOpen && (
                <UserFormModal
                    user={selectedUser}
                    users={users}
                    roles={roles}
                    onClose={() => setIsUserFormModalOpen(false)}
                    onSave={handleSaveUser}
                />
            )}
            {confirmationState && <ConfirmationModal {...confirmationState} onClose={() => setConfirmationState(null)} />}
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

export default UsersRolesPage;
