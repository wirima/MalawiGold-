
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    const { currentUser, users, setCurrentUser, roles, hasPermission } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleUserChange = (user: User) => {
        setCurrentUser(user);
        setIsDropdownOpen(false);
    };
    
    const currentRoleName = roles.find(r => r.id === currentUser?.roleId)?.name;

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

    return (
        <header className="h-20 bg-white dark:bg-slate-800/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center">
                {/* Mobile menu button can be added here */}
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <input type="text" placeholder="Search..." className="w-64 pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                 <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700">
                            <img src={`https://i.pravatar.cc/100?u=${currentUser?.id}`} alt="User Avatar" className="w-full h-full rounded-full object-cover"/>
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{currentRoleName}</p>
                        </div>
                         <svg className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 py-1 z-10">
                            {hasPermission('users:view') && (
                                <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">My Profile</Link>
                            )}
                            <div className="px-4 py-2 border-t dark:border-slate-700">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Switch User</p>
                            </div>
                            {users.map(user => {
                                const roleName = roles.find(r => r.id === user.roleId)?.name;
                                return (
                                    <button 
                                        key={user.id} 
                                        onClick={() => handleUserChange(user)}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${
                                            currentUser?.id === user.id 
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`
                                        }
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600">
                                            <img src={`https://i.pravatar.cc/100?u=${user.id}`} alt={user.name} className="w-full h-full rounded-full object-cover"/>
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-slate-500">{roleName}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;