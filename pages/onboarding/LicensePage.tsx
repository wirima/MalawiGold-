import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LicensePage: React.FC = () => {
    const [licenseKey, setLicenseKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { verifyLicense } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!licenseKey.trim()) {
            setError('Please enter your license key.');
            return;
        }
        setLoading(true);
        try {
            await verifyLicense(licenseKey);
            navigate('/onboarding/business-info');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <div className="p-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Your License</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Please enter the license key you received after subscribing.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="licenseKey" className="sr-only">License Key</label>
                        <input
                            id="licenseKey"
                            name="licenseKey"
                            type="text"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            required
                            className="block w-full px-4 py-3 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 text-center font-mono tracking-widest"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {loading ? 'Verifying...' : 'Activate & Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LicensePage;
