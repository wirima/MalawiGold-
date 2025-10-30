import React, { useState, useMemo, useEffect } from 'react';

interface AgeVerificationModalProps {
    isOpen: boolean;
    minimumAge: number;
    onSuccess: () => void;
    onClose: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ isOpen, minimumAge, onSuccess, onClose }) => {
    const [birthDate, setBirthDate] = useState({ year: '', month: '', day: '' });
    const yearInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form and focus on the year input when modal opens
            setBirthDate({ year: '', month: '', day: '' });
            setTimeout(() => yearInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const { age, isVerified, isValidDate } = useMemo(() => {
        const { year, month, day } = birthDate;
        if (!year || !month || !day || year.length < 4 || month.length < 1 || day.length < 1) {
            return { age: null, isVerified: false, isValidDate: false };
        }

        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);

        if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) || monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
            return { age: null, isVerified: false, isValidDate: false };
        }
        
        // Basic date validation
        const testDate = new Date(yearNum, monthNum - 1, dayNum);
        if (testDate.getFullYear() !== yearNum || testDate.getMonth() !== monthNum - 1 || testDate.getDate() !== dayNum) {
            return { age: null, isVerified: false, isValidDate: false };
        }

        const today = new Date();
        const dob = new Date(yearNum, monthNum - 1, dayNum);

        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            calculatedAge--;
        }

        return { age: calculatedAge, isVerified: calculatedAge >= minimumAge, isValidDate: true };
    }, [birthDate, minimumAge]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value)) { // Only allow digits
            setBirthDate(prev => ({ ...prev, [name]: value }));
        }
    };

    if (!isOpen) {
        return null;
    }

    let statusText: string;
    let statusColorClass: string;

    if (age === null) {
        statusText = 'Enter Date of Birth';
        statusColorClass = 'text-slate-500 dark:text-slate-400';
    } else if (isVerified) {
        statusText = `Verified (${age} years old)`;
        statusColorClass = 'text-green-500 dark:text-green-400';
    } else {
        statusText = `Underage (${age} years old)`;
        statusColorClass = 'text-red-500 dark:text-red-400';
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-bold">Age Verification Required</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Please verify the customer's age using a valid ID. Minimum age is <span className="font-bold">{minimumAge}</span>.</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="month" className="block text-xs font-medium text-center">Month</label>
                            <input type="text" id="month" name="month" value={birthDate.month} onChange={handleInputChange} placeholder="MM" maxLength={2} className="mt-1 text-center w-full text-2xl font-bold rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="day" className="block text-xs font-medium text-center">Day</label>
                            <input type="text" id="day" name="day" value={birthDate.day} onChange={handleInputChange} placeholder="DD" maxLength={2} className="mt-1 text-center w-full text-2xl font-bold rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="year" className="block text-xs font-medium text-center">Year</label>
                            <input type="text" id="year" name="year" value={birthDate.year} ref={yearInputRef} onChange={handleInputChange} placeholder="YYYY" maxLength={4} className="mt-1 text-center w-full text-2xl font-bold rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm" />
                        </div>
                    </div>
                    <div className={`mt-4 text-center h-6 font-semibold ${statusColorClass}`}>{statusText}</div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                        Cancel
                    </button>
                    <button onClick={onSuccess} disabled={!isVerified} className="w-full rounded-md border border-transparent px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed">
                        Confirm & Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgeVerificationModal;
