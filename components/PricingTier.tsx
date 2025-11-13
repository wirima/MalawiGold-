import React from 'react';

interface PricingTierProps {
    name: string;
    price: number;
    features: string[];
    isFeatured?: boolean;
    isCurrentPlan?: boolean;
    onSelect: () => void;
}

const PricingTier: React.FC<PricingTierProps> = ({ name, price, features, isFeatured, isCurrentPlan, onSelect }) => {
    const annualPrice = Math.round(price * 12 * 0.9);

    const buttonText = isCurrentPlan ? 'Current Plan' : `Choose ${name}`;
    const buttonDisabled = isCurrentPlan;

    // Base classes
    const containerClasses = "rounded-2xl p-8 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden";
    const buttonClasses = "w-full mt-8 py-3 px-6 rounded-lg font-semibold text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed";

    if (isFeatured) {
        return (
            <div className={`${containerClasses} bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white transform md:scale-105`}>
                <div className="absolute top-0 right-0 m-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white text-indigo-600">
                        Best Value
                    </span>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-white">{name}</h3>
                    <p className="text-center mt-4">
                        <span className="text-5xl font-bold text-white">${price}</span>
                        <span className="text-indigo-200">/month</span>
                    </p>
                    <p className="text-center text-sm text-indigo-200 mt-2">
                        or ${annualPrice}/year (10% discount)
                    </p>
                </div>
                <ul className="mt-8 space-y-4 text-sm">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="ml-3 text-indigo-100">{feature}</span>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={onSelect}
                    disabled={buttonDisabled}
                    className={`${buttonClasses} ${isCurrentPlan 
                        ? 'ring-2 ring-white text-white bg-transparent hover:bg-transparent' 
                        : 'bg-white text-indigo-600 hover:bg-indigo-100'}`}
                >
                    {buttonText}
                </button>
            </div>
        );
    }

    return (
        <div className={`${containerClasses} bg-white dark:bg-slate-800 border dark:border-slate-700`}>
            <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h3>
                <p className="text-center mt-4">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white">${price}</span>
                    <span className="text-slate-500 dark:text-slate-400">/month</span>
                </p>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                    or ${annualPrice}/year (10% discount)
                </p>
            </div>
            <ul className="mt-8 space-y-4 text-sm">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                ))}
            </ul>
             <button
                onClick={onSelect}
                disabled={buttonDisabled}
                className={`${buttonClasses} ${isCurrentPlan 
                    ? 'ring-2 ring-indigo-500 text-indigo-500 bg-transparent hover:bg-transparent' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
                {buttonText}
            </button>
        </div>
    );
};

export default PricingTier;
