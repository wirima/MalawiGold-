import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UnderConstructionPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-indigo-400 dark:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185v17.08-1.5l-3.75 1.5-3.75-1.5-3.75 1.5z" />
            </svg>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                Under Construction
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
                This feature is currently being developed and will be available soon.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                Go Back
            </button>
        </div>
    );
};

export default UnderConstructionPage;