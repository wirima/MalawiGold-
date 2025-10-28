
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-9xl font-black text-slate-300 dark:text-slate-700">404</h1>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                Page not found
            </p>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
                Sorry, we couldn’t find the page you’re looking for.
            </p>
            <Link
                to="/"
                className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                Go back home
            </Link>
        </div>
    );
};

export default NotFoundPage;
