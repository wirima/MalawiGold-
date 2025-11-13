import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Welcome to TranscendPOS!
            </h1>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Your account is ready. Let's get your business set up in just a few quick steps.
            </p>
            <div className="mt-8">
                <button
                    onClick={() => navigate('/onboarding/license')}
                    className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default WelcomePage;
