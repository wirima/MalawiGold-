import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { useOffline } from '../contexts/OfflineContext';
import CustomerRequestModal from './CustomerRequestModal';
import { useTranslation } from '../src/i18n';
import LanguageSwitcher from '../src/components/LanguageSwitcher';

const Header: React.FC = () => {
    const { user, currentUser, signOut, roles, hasPermission } = useAuth();
    const navigate = useNavigate();
    const { isOnline, syncQueue } = useOffline();
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const currentRole = useMemo(() => currentUser ? roles.find(r => r.id === currentUser.roleId) : undefined, [currentUser, roles]);
    const isCashier = currentRole?.name === 'Cashier';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    if (!user || !currentUser || !currentRole) {
        // This should not happen if inside a protected route, but it's a good safeguard.
        return null;
    }

    return (
        <>
            <header className="h-20 bg-white dark:bg-slate-800/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center">
                    {/* Mobile menu button can be added here */}
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{t('dashboard')}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                             {syncQueue.length > 0 && (
                                <div className="relative" title={`${syncQueue.length} items pending sync`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 animate-pulse" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 13V9m0 8h.01" />
                                    </svg>
                                    <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                        {syncQueue.length}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <input type="text" placeholder={t('searchPlaceholder')} className="w-64 ps-10 pe-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                            <svg className="w-5 h-5 text-slate-400 absolute start-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                    </div>
                    <div className="w-32">
                        <LanguageSwitcher />
                    </div>
                    <Link to="/app" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-label="Go to dashboard" title="Home">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
                        </svg>
                    </Link>
                    {isCashier && (
                        <button 
                            onClick={() => setIsRequestModalOpen(true)}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Close Terminal
                        </button>
                    )}
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700">
                                <img src={`https://i.pravatar.cc/100?u=${user.id}`} alt="User Avatar" className="w-full h-full rounded-full object-cover"/>
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.name || user.email}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{currentRole.name}</p>
                            </div>
                            <svg className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute end-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 py-1 z-10">
                                {hasPermission('users:view') && (
                                    <Link to="/app/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">My Profile</Link>
                                )}
                                <div className="my-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                                <button 
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {isRequestModalOpen && currentUser && (
                <CustomerRequestModal 
                    cashier={currentUser}
                    onClose={() => setIsRequestModalOpen(false)}
                />
            )}
        </>
    );
};

export default Header;