import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfilePage: React.FC = () => {
    const { currentUser, hasPermission, updateUser, updateUserPassword } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [showSuccess, setShowSuccess] = useState(false);
    
    // State for password change
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                email: currentUser.email,
            });
        }
    }, [currentUser]);

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

    if (!currentUser) {
        return <p>Loading user profile...</p>;
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        updateUser({ ...currentUser, ...formData });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }
        try {
            await updateUserPassword(newPassword);
            setPasswordSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error: any) {
            setPasswordError(error.message);
        }
    };
    
    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";


    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Update your personal information.</p>
                </div>
                <form onSubmit={handleProfileSubmit}>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center space-x-6">
                            <img 
                                src={`https://i.pravatar.cc/150?u=${currentUser.id}`} 
                                alt="User Avatar"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input 
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={baseInputClasses}
                            />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <input 
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={baseInputClasses}
                            />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end items-center gap-3">
                         {showSuccess && <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>}
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md mt-8">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold">Change Password</h1>
                </div>
                <form onSubmit={handlePasswordChange}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                            <input type="password" id="newPassword" name="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className={baseInputClasses} />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={baseInputClasses} />
                        </div>
                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end items-center gap-3">
                         {passwordSuccess && <p className="text-sm text-green-600 dark:text-green-400">Password updated successfully!</p>}
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfilePage;
