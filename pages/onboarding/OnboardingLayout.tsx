import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Stepper from '../../components/Stepper';

const OnboardingLayout: React.FC = () => {
    const location = useLocation();
    
    const steps = ['Welcome', 'License Key', 'Business Info'];
    
    let currentStep = 0;
    if (location.pathname.includes('license')) {
        currentStep = 1;
    } else if (location.pathname.includes('business-info')) {
        currentStep = 2;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 px-4">
            <div className="w-full max-w-2xl">
                <div className="mb-12">
                    <Stepper steps={steps} currentStep={currentStep} />
                </div>
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default OnboardingLayout;
