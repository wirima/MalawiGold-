import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AgeVerificationModalProps {
    isOpen: boolean;
    minimumAge: number;
    onSuccess: () => void;
    onClose: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ isOpen, minimumAge, onSuccess, onClose }) => {
    const { ageVerificationSettings } = useAuth();
    const [birthDate, setBirthDate] = useState({ year: '', month: '', day: '' });
    const [view, setView] = useState<'manual' | 'camera' | 'hardware'>('manual');
    const [scanResult, setScanResult] = useState<{ status: 'valid' | 'underage' | 'expired' | 'fake' | 'scanning' | null; message: string }>({ status: null, message: '' });
    
    // Refs for input fields to manage focus
    const monthInputRef = useRef<HTMLInputElement>(null);
    const dayInputRef = useRef<HTMLInputElement>(null);
    const yearInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            setBirthDate({ year: '', month: '', day: '' });
            setView('manual');
            setScanResult({ status: null, message: '' });
            // Auto-focus the month input when the modal opens
            setTimeout(() => monthInputRef.current?.focus(), 100);
        } else {
            // Cleanup camera stream when modal is closed
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
    }, [isOpen]);

    // Effect for handling camera stream
    useEffect(() => {
        if (view === 'camera' && !streamRef.current) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        streamRef.current = stream;
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera:", err);
                    setScanResult({ status: 'fake', message: 'Camera access denied. Please enable camera permissions.' });
                });
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [view]);

    const { age, isVerified } = useMemo(() => {
        const { year, month, day } = birthDate;
        if (!year || !month || !day || year.length < 4 || month.length < 1 || day.length < 1) return { age: null, isVerified: false };
        const yearNum = parseInt(year, 10), monthNum = parseInt(month, 10), dayNum = parseInt(day, 10);
        const today = new Date(), dob = new Date(yearNum, monthNum - 1, dayNum);
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) calculatedAge--;
        return { age: calculatedAge, isVerified: calculatedAge >= minimumAge };
    }, [birthDate, minimumAge]);
    
    // Handles auto-forwarding focus when a field is filled
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value)) {
            setBirthDate(prev => ({ ...prev, [name]: value }));

            if (name === 'month' && value.length === 2) {
                dayInputRef.current?.focus();
            } else if (name === 'day' && value.length === 2) {
                yearInputRef.current?.focus();
            }
        }
    };

    // Handles smart backspace to move focus backward
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (e.key === 'Backspace' && target.value === '') {
            if (target.name === 'day') {
                monthInputRef.current?.focus();
            } else if (target.name === 'year') {
                dayInputRef.current?.focus();
            }
        }
    };

    const handleScanSimulation = (type: 'valid' | 'underage' | 'expired' | 'fake') => {
        switch(type) {
            case 'valid':
                setScanResult({ status: 'valid', message: 'ID Verified. Age: 25. Adding to cart...' });
                setTimeout(onSuccess, 1500);
                break;
            case 'underage':
                setScanResult({ status: 'underage', message: 'Scan complete. Customer is underage (19).' });
                break;
            case 'expired':
                setScanResult({ status: 'expired', message: 'Scan failed. ID is expired.' });
                break;
            case 'fake':
                setScanResult({ status: 'fake', message: 'Scan failed. Could not validate ID.' });
                break;
        }
    };
    
    const handleHardwareScanSimulation = () => {
        setScanResult({ status: 'scanning', message: 'Processing...' });
        setTimeout(() => {
            setScanResult({ status: 'valid', message: 'ID Verified via Scanner. Age: 32. Adding to cart...' });
            setTimeout(onSuccess, 1500);
        }, 1500);
    }


    if (!isOpen) return null;

    const renderManualView = () => {
        let statusText: string, statusColorClass: string;
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
            <>
                 <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="month" className="block text-xs font-medium text-center">Month</label>
                            <input type="text" id="month" name="month" value={birthDate.month} onChange={handleInputChange} ref={monthInputRef} placeholder="MM" maxLength={2} className="mt-1 text-center w-full text-2xl font-bold rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="day" className="block text-xs font-medium text-center">Day</label>
                            <input type="text" id="day" name="day" value={birthDate.day} onChange={handleInputChange} onKeyDown={handleKeyDown} ref={dayInputRef} placeholder="DD" maxLength={2} className="mt-1 text-center w-full text-2xl font-bold rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="year" className="block text-xs font-medium text-center">Year</label>
                            <input type="text" id="year" name="year" value={birthDate.year} onChange={handleInputChange} onKeyDown={handleKeyDown} ref={yearInputRef} placeholder="YYYY" maxLength={4} className="mt-1 text-center w-full text-2xl font-bold rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm" />
                        </div>
                    </div>
                    <div className={`mt-4 text-center h-6 font-semibold ${statusColorClass}`}>{statusText}</div>
                </div>
                 <div className="p-4 grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={onSuccess} disabled={!isVerified} className="w-full rounded-md border border-transparent px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed">Confirm & Add</button>
                </div>
            </>
        );
    }
    
    const renderCameraView = () => (
        <>
            <div className="p-2 bg-black rounded-t-lg">
                <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover rounded-md bg-slate-900"></video>
                <div className={`mt-2 text-center h-6 font-semibold ${
                    scanResult.status === 'valid' ? 'text-green-400' : 
                    scanResult.status ? 'text-red-400' : 'text-slate-400'
                }`}>{scanResult.message || 'Position ID inside the frame...'}</div>
            </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
                <p className="text-xs text-center text-slate-500 mb-2">For demonstration purposes:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <button onClick={() => handleScanSimulation('valid')} className="p-2 bg-green-500/20 text-green-700 dark:text-green-300 rounded-md">Simulate Valid ID</button>
                    <button onClick={() => handleScanSimulation('underage')} className="p-2 bg-red-500/20 text-red-700 dark:text-red-300 rounded-md">Simulate Underage</button>
                    <button onClick={() => handleScanSimulation('expired')} className="p-2 bg-red-500/20 text-red-700 dark:text-red-300 rounded-md">Simulate Expired</button>
                    <button onClick={() => handleScanSimulation('fake')} className="p-2 bg-red-500/20 text-red-700 dark:text-red-300 rounded-md">Simulate Fake/Error</button>
                </div>
            </div>
            <div className="p-4"><button onClick={() => setView('manual')} className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-base font-medium">Back to Manual Entry</button></div>
        </>
    );
    
    const renderHardwareView = () => (
         <>
            <div className="p-8 text-center min-h-[240px] flex flex-col justify-center items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${scanResult.status === 'valid' ? 'text-green-500' : 'text-indigo-500'} ${scanResult.status === 'scanning' ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5m0 16.5v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" /></svg>
                <h3 className="mt-4 text-xl font-bold">{scanResult.message || 'Waiting for ID Scan...'}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Swipe or scan government-issued ID on the connected hardware scanner.</p>
            </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                <p className="text-xs text-center text-slate-500">For demonstration purposes:</p>
                <button onClick={handleHardwareScanSimulation} className="w-full p-2 bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-md text-sm">Simulate Successful Scan</button>
            </div>
            <div className="p-4"><button onClick={() => setView('manual')} className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-base font-medium">Back to Manual Entry</button></div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                {view === 'manual' && (
                    <div className="p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-orange-400" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <h3 className="mt-4 text-xl font-bold">Age Verification Required</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Minimum age is <span className="font-bold">{minimumAge}</span>.</p>
                    </div>
                )}

                {view === 'manual' ? renderManualView() : view === 'camera' ? renderCameraView() : renderHardwareView()}
                
                {ageVerificationSettings.isIdScanningEnabled && view === 'manual' && (
                    <div className="p-4 border-t dark:border-slate-700 grid grid-cols-2 gap-2 text-sm">
                        <button onClick={() => setView('camera')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                           Scan with Camera
                        </button>
                        <button onClick={() => setView('hardware')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.333A4.011 4.011 0 0115 9.333V15a1 1 0 11-2 0v-5.667a2.011 2.011 0 00-2-2H9a2.011 2.011 0 00-2 2V15a1 1 0 11-2 0v-5.667A4.011 4.011 0 019 5.333V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                           Use Hardware Scanner
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgeVerificationModal;