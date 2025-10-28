
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ReportPlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
    const { hasPermission } = useAuth();

    if (!hasPermission('reports:view')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to view reports.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-indigo-400 dark:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                {title}
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
                This report is currently under construction and will be available soon.
            </p>
            <Link
                to="/"
                className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
                Go to Dashboard
            </Link>
        </div>
    );
};

export default ReportPlaceholderPage;
