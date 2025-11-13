import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BrandingSettings } from '../../types';

const BusinessInfoPage: React.FC = () => {
    const { brandingSettings, updateBrandingSettings, completeOnboarding, hasPermission } = useAuth();
    const [settings, setSettings] = useState<BrandingSettings>(brandingSettings);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // In a real app, you'd save this to the backend
        updateBrandingSettings(settings);
        await completeOnboarding();
        setLoading(false);
        navigate('/app');
    };
    
    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit}>
                <div className="p-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Set Up Your Business Profile</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            This information will be used on your receipts and other documents.
                        </p>
                    </div>
                    <div className="mt-8 space-y-4">
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium">Business Name</label>
                            <input type="text" id="businessName" name="businessName" value={settings.businessName} onChange={handleInputChange} required className={baseInputClasses} />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium">Address</label>
                            <textarea id="address" name="address" value={settings.address} onChange={handleInputChange} required rows={3} className={baseInputClasses} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium">Phone Number</label>
                                <input type="text" id="phone" name="phone" value={settings.phone} onChange={handleInputChange} required className={baseInputClasses} />
                            </div>
                            <div>
                                <label htmlFor="website" className="block text-sm font-medium">Website (Optional)</label>
                                <input type="text" id="website" name="website" value={settings.website || ''} onChange={handleInputChange} className={baseInputClasses} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        {loading ? 'Saving...' : 'Complete Setup & Go to Dashboard'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BusinessInfoPage;
