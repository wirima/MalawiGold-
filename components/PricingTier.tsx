import React from 'react';

interface PricingTierProps {
    name: string;
    price: number;
    features: string[];
    isFeatured?: boolean;
}

const PricingTier: React.FC<PricingTierProps> = ({ name, price, features, isFeatured }) => {
    const annualPrice = Math.round(price * 12 * 0.9);

    return (
        <div className={`rounded-lg p-8 border ${isFeatured ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-500' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
            {isFeatured && (
                <p className="text-center font-semibold text-indigo-600 dark:text-indigo-400">Best Value</p>
            )}
            <h3 className="text-2xl font-bold text-center">{name}</h3>
            <p className="text-center mt-4">
                <span className="text-4xl font-bold">${price}</span>
                <span className="text-slate-500">/month</span>
            </p>
            <p className="text-center text-sm text-slate-500 mt-2">
                or ${annualPrice}/year (10% discount)
            </p>
            <ul className="mt-8 space-y-4 text-sm">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                ))}
            </ul>
             <button
                disabled
                className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                    isFeatured 
                        ? 'bg-indigo-600 text-white cursor-not-allowed opacity-50' 
                        : 'bg-indigo-100 text-indigo-700 cursor-not-allowed opacity-50'
                }`}
            >
                Get Started
            </button>
        </div>
    );
};

export default PricingTier;
