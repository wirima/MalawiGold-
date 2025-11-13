import React from 'react';
import { Link } from 'react-router-dom';

const SignUpPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ready to Get Started?</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    To create an account, please select a subscription plan. You'll be able to create your account and check out in a single step.
                </p>
                <div className="mt-6 flex flex-col gap-4">
                    <Link to="/subscription" className="w-full inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        View Pricing & Sign Up
                    </Link>
                    <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                        Already have an account? Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;