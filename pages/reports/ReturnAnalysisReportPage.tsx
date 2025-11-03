import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getReturnAnalysisInsights } from '../../services/geminiService';

const ReturnAnalysisReportPage: React.FC = () => {
    const { customerReturns, hasPermission } = useAuth();
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    if (!hasPermission('reports:return_analysis')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">You do not have permission to view this report.</p>
            </div>
        );
    }

    const handleGenerateAnalysis = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const result = await getReturnAnalysisInsights(customerReturns);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [customerReturns]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold">Return Analysis Report</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Analyze return patterns to improve products and services.</p>
                </div>
                <div className="p-6">
                     <div className="prose prose-slate dark:prose-invert max-w-none">
                        <h3>AI-Powered Return Analysis</h3>
                        <p>Use the button below to send customer return data to the Gemini API. It will analyze the feedback for trends and provide actionable recommendations to reduce returns.</p>
                        <button onClick={handleGenerateAnalysis} disabled={isLoading || customerReturns.length === 0} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center no-prose">
                            {isLoading ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                            ) : 'Generate Return Analysis'}
                        </button>
                        {error && <p className="text-red-500 mt-4 no-prose">{error}</p>}
                        {analysis && (
                            <div className="mt-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg"
                                    dangerouslySetInnerHTML={{ __html: analysis }}
                                />
                            </div>
                        )}
                     </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                     <h2 className="text-xl font-bold">Raw Customer Return Log</h2>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Original Sale</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Products Returned</th>
                                <th scope="col" className="px-6 py-3">Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerReturns.length > 0 ? customerReturns.map(req => (
                                <tr key={req.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(req.date).toLocaleString()}</td>
                                    <td className="px-6 py-4">{req.originalSaleId}</td>
                                    <td className="px-6 py-4">{req.customer.name}</td>
                                    <td className="px-6 py-4">
                                        <ul className="list-disc list-inside">
                                            {req.items.map(item => <li key={item.id}>{item.name} (Qty: {item.quantity})</li>)}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="whitespace-pre-wrap">{req.reason}</p>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No customer returns have been logged yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReturnAnalysisReportPage;