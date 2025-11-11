import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const PublicHeader: React.FC = () => {
    const { brandingSettings } = useAuth();
    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center gap-3">
                            {brandingSettings.logoUrl ? (
                                <img src={brandingSettings.logoUrl} alt={brandingSettings.businessName} className="h-10 object-contain" />
                            ) : (
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{brandingSettings.businessName}</span>
                            )}
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        <Link to="/" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            Home
                        </Link>
                        <Link to="/subscription" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            Pricing
                        </Link>
                        <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            Live Demo
                        </Link>
                        <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            Sign In
                        </Link>
                        <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PublicHeader;