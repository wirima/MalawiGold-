import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BrandingSettingsPage: React.FC = () => {
    const { brandingSettings, updateBrandingSettings, resetBrandingSettings, hasPermission } = useAuth();
    const [settings, setSettings] = useState(brandingSettings);
    const [logoPreview, setLogoPreview] = useState<string>(brandingSettings.logoUrl);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!hasPermission('settings:view')) { // Assume branding is part of general settings view
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage branding settings.
                </p>
            </div>
        );
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setSettings(prev => ({ ...prev, logoUrl: dataUrl }));
                setLogoPreview(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        updateBrandingSettings(settings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all branding to the default settings?")) {
            resetBrandingSettings();
            setSettings({ businessName: 'Gemini POS', logoUrl: '', address: '123 AI Street, Tech City, 12345', phone: '(555) 123-4567', website: 'www.example.com' });
            setLogoPreview('');
        }
    };

    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold">Branding Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Customize the look and feel of the application for your business.
                    </p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium">Business Name</label>
                            <input type="text" id="businessName" name="businessName" value={settings.businessName} onChange={handleInputChange} className={baseInputClasses} />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium">Address</label>
                            <textarea id="address" name="address" value={settings.address} onChange={handleInputChange} rows={3} className={baseInputClasses} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium">Phone Number</label>
                                <input type="text" id="phone" name="phone" value={settings.phone} onChange={handleInputChange} className={baseInputClasses} />
                            </div>
                            <div>
                                <label htmlFor="website" className="block text-sm font-medium">Website</label>
                                <input type="text" id="website" name="website" value={settings.website} onChange={handleInputChange} className={baseInputClasses} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Business Logo</label>
                        <div className="mt-1 flex flex-col items-center">
                            <div className="w-40 h-40 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain rounded-lg" />
                                ) : (
                                    <span className="text-sm text-slate-500">No Logo</span>
                                )}
                            </div>
                            <label htmlFor="logo-upload" className="mt-4 cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                                <span>{logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                                <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg, image/svg+xml" />
                            </label>
                             {logoPreview && (
                                <button type="button" onClick={() => { setLogoPreview(''); setSettings(p => ({...p, logoUrl: ''})); }} className="mt-2 text-xs text-red-500 hover:underline">
                                    Remove Logo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-between items-center">
                    <button type="button" onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50">
                        Reset to Defaults
                    </button>
                    <div className="flex items-center gap-4">
                        {showSuccess && <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully!</p>}
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                            Save Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BrandingSettingsPage;