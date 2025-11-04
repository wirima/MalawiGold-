import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';

const PaymentGatewayConnectionPage: React.FC = () => {
    const { integrations, addIntegration, updateIntegration, hasPermission, businessLocations } = useAuth();
    const navigate = useNavigate();
    const { connectionId } = useParams<{ connectionId: string }>();

    const isEditing = !!connectionId;
    const existingConnection = isEditing ? integrations.find(i => i.id === connectionId && i.provider === 'payment-gateway') : null;

    const [name, setName] = useState(existingConnection?.name || '');
    const [publishableKey, setPublishableKey] = useState(existingConnection?.config.publishableKey || '');
    const [apiKey, setApiKey] = useState(''); // Always empty for security (Secret Key)
    const [locationId, setLocationId] = useState(existingConnection?.config.locationId || businessLocations[0]?.id || '');

    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);
    const [errors, setErrors] = useState({ name: '', publishableKey: '', apiKey: '' });

    useEffect(() => {
        if (isEditing && !existingConnection) {
            navigate('/settings/integrations');
        }
    }, [isEditing, existingConnection, navigate]);


    if (!hasPermission('settings:integrations')) {
        return <div className="text-center p-8">Access Denied.</div>;
    }

    const validate = () => {
        const newErrors = { name: '', publishableKey: '', apiKey: '' };
        let isValid = true;
        if (!name.trim()) { newErrors.name = 'Connection name is required.'; isValid = false; }
        if (!publishableKey.trim()) { newErrors.publishableKey = 'Publishable Key is required.'; isValid = false; }
        if (!isEditing && !apiKey.trim()) { newErrors.apiKey = 'Secret Key is required for new connections.'; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const handleTestConnection = () => {
        if (!publishableKey.trim() || (!isEditing && !apiKey.trim())) {
            setTestResult('failed');
            return;
        }
        setIsTesting(true);
        setTestResult(null);
        setTimeout(() => {
            if (publishableKey.startsWith('pk_') && (apiKey.startsWith('sk_') || isEditing)) {
                setTestResult('success');
            } else {
                setTestResult('failed');
            }
            setIsTesting(false);
        }, 1500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const connectionData = {
                provider: 'payment-gateway' as const,
                name,
                config: {
                    publishableKey,
                    locationId,
                    ...(apiKey && { apiKey }), 
                },
            };

            if (isEditing && existingConnection) {
                updateIntegration({ ...existingConnection, ...connectionData });
            } else {
                addIntegration(connectionData);
            }
            navigate('/settings/integrations');
        }
    };

    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
    const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 border-b dark:border-slate-700">
                    <h1 className="text-2xl font-bold">{isEditing ? 'Edit Payment Gateway' : 'Add Payment Gateway'}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your Stripe, Square, or other payment processor.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">Connection Name*</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Downtown Stripe Reader" className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`} />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                     <div>
                        <label htmlFor="locationId" className="block text-sm font-medium">Terminal Location</label>
                        <select id="locationId" value={locationId} onChange={e => setLocationId(e.target.value)} className={baseInputClasses}>
                            {businessLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="publishableKey" className="block text-sm font-medium">Publishable Key*</label>
                        <input type="text" id="publishableKey" value={publishableKey} onChange={e => setPublishableKey(e.target.value)} placeholder="pk_test_..." className={`${baseInputClasses} ${errors.publishableKey ? errorInputClasses : ''}`} />
                         {errors.publishableKey && <p className="mt-1 text-sm text-red-600">{errors.publishableKey}</p>}
                    </div>
                     <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium">Secret Key*</label>
                        <input type="password" id="apiKey" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={isEditing ? 'Leave blank to keep existing key' : 'sk_test_...'} className={`${baseInputClasses} ${errors.apiKey ? errorInputClasses : ''}`} />
                         {errors.apiKey && <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>}
                        <p className="mt-1 text-xs text-slate-500">Your secret key is securely stored and will not be displayed here again.</p>
                    </div>
                    <div className="pt-2">
                        <button type="button" onClick={handleTestConnection} disabled={isTesting} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50">
                            {isTesting ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                            Test Connection
                        </button>
                        {testResult === 'success' && <p className="mt-2 text-sm text-green-600">Connection successful!</p>}
                        {testResult === 'failed' && <p className="mt-2 text-sm text-red-600">Connection failed. Please check your keys.</p>}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                    <Link to="/settings/integrations" className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</Link>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save Connection</button>
                </div>
            </form>
        </div>
    );
};

export default PaymentGatewayConnectionPage;