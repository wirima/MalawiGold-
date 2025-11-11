import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Footer: React.FC = () => {
    const { brandingSettings } = useAuth();
    
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4">
                    <div className="flex justify-center gap-x-6">
                        <Link to="/database-setup" className="text-sm leading-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            Database Setup Guide
                        </Link>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        &copy; {new Date().getFullYear()} {brandingSettings.businessName}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;