

import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    change?: string;
    changeType?: 'positive' | 'negative';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, change, changeType }) => {
    const changeColor = changeType === 'positive' ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex items-center justify-between transition-transform hover:scale-105">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                {change && (
                    <p className={`text-sm mt-2 ${changeColor}`}>
                        {change}
                    </p>
                )}
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {icon}
            </div>
        </div>
    );
};

export default DashboardCard;