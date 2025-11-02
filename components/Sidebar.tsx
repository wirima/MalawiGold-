
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, NavItem } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [openSubMenu, setOpenSubMenu] = useState<string | null>('Sell');
    const { hasPermission } = useAuth();

    const toggleSubMenu = (label: string) => {
        setOpenSubMenu(openSubMenu === label ? null : label);
    };

    const NavLink: React.FC<{path: string, label: string}> = ({path, label}) => {
        const isActive = location.pathname === path;
        return (
            <Link
                to={path}
                className={`flex items-center p-2 text-base font-normal rounded-lg transition-colors
                    ${isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
            >
                <span className="ml-3">{label}</span>
            </Link>
        )
    };

    return (
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 flex flex-col">
            <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Gemini POS</h1>
            </div>
            <nav className="flex-1 px-4 py-4 overflow-y-auto">
                <ul className="space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        
                        const visibleSubItems = hasSubItems 
                            ? item.subItems!.filter(sub => !sub.permission || hasPermission(sub.permission as Permission)) 
                            : [];

                        const showTopLevelItem = (
                            (!hasSubItems && (!item.permission || hasPermission(item.permission as Permission))) ||
                            (hasSubItems && visibleSubItems.length > 0)
                        );
                        
                        if (!showTopLevelItem) {
                            return null;
                        }

                        return (
                            <li key={item.label}>
                                {hasSubItems ? (
                                    <>
                                        <button
                                            onClick={() => toggleSubMenu(item.label)}
                                            className="flex items-center w-full p-2 text-base font-normal text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 group"
                                        >
                                            {item.icon}
                                            <span className="flex-1 ml-3 text-left whitespace-nowrap">{item.label}</span>
                                            <svg className={`w-6 h-6 transition-transform ${openSubMenu === item.label ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                        </button>
                                        {openSubMenu === item.label && (
                                            <ul className="pl-6 mt-2 space-y-2">
                                                {visibleSubItems.map(subItem => (
                                                    <li key={subItem.path}>
                                                        <NavLink path={subItem.path!} label={subItem.label} />
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                               <Link to={item.path || '#'} className={`flex items-center p-2 text-base font-normal rounded-lg transition-colors ${location.pathname === item.path ? 'bg-indigo-600 text-white' : 'text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                    {item.icon}
                                    <span className="ml-3">{item.label}</span>
                                </Link>
                            )}
                        </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
