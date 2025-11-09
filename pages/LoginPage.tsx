import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const { signIn, signInAsDeveloper } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // State for the developer login modal
    const [isDevModalOpen, setIsDevModalOpen] = useState(false);
    const [devAnswer, setDevAnswer] = useState('');
    const [devError, setDevError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signIn(email, password);
            navigate('/app');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeveloperLogin = () => {
        setDevError('');
        if (devAnswer === 'natembo78') {
            signInAsDeveloper();
            navigate('/app');
        } else {
            setDevError('Incorrect answer. Please try again.');
        }
    };

    const openDevModal = () => {
        setDevAnswer('');
        setDevError('');
        setIsDevModalOpen(true);
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sign In</h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Welcome back to ZawiPOS</p>
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-white"
                            />
                        </div>

                         <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or</span>
                        </div>
                    </div>

                     <div>
                        <button
                            type="button"
                            onClick={openDevModal}
                            className="w-full flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign In as Developer
                        </button>
                    </div>

                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
            {isDevModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Developer Access</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">To prevent abuse, please answer the security question.</p>
                            <div className="mt-4">
                                <label htmlFor="dev-secret" className="block text-sm font-medium text-slate-700 dark:text-slate-300">What is your mother's maiden name?</label>
                                <input
                                    id="dev-secret"
                                    type="password"
                                    value={devAnswer}
                                    onChange={(e) => setDevAnswer(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleDeveloperLogin()}
                                    className="mt-1 block w-full px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                    autoFocus
                                />
                                {devError && <p className="mt-2 text-sm text-red-500">{devError}</p>}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-3 rounded-b-lg">
                            <button onClick={() => setIsDevModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                            <button onClick={handleDeveloperLogin} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LoginPage;
