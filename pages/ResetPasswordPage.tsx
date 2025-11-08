import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                // This event fires when the user is redirected from the email link.
                // Supabase client handles the session creation from the URL fragment.
                // We don't need to manually parse the token.
            }
        });
        
        return () => subscription.unsubscribe();
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setLoading(true);
        setError(null);
        
        const { error: updateError } = await supabase.auth.updateUser({ password: password });

        if (updateError) {
             setError(updateError.message);
        } else {
             setMessage('Your password has been updated successfully! You will be redirected to sign in.');
             setTimeout(() => navigate('/login'), 3000);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-black">Reset Your Password</h1>
                </div>
                {message ? (
                    <div className="text-center p-4 bg-green-100 text-green-700 rounded-md">
                        <p>{message}</p>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-black">New Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 rounded-md bg-slate-100 border-transparent focus:border-indigo-500 focus:ring-indigo-500 text-black"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                )}
                 <p className="text-center text-sm text-black">
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Back to Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
