
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Draft } from '../types';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

const ListDraftsPage: React.FC = () => {
    const { drafts, hasPermission, deleteDraft } = useAuth();
    const { formatCurrency } = useCurrency();
    
    const canManage = hasPermission('sell:manage');
    const canView = hasPermission('sell:view');

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to view drafts.
                </p>
            </div>
        );
    }

    const handleDelete = (draft: Draft) => {
        if (window.confirm(`Are you sure you want to delete draft ${draft.id}? This cannot be undone.`)) {
            deleteDraft(draft.id);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">List Drafts</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your saved sales drafts.</p>
                    </div>
                    <Link
                        to="/sell/drafts/add"
                        className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => !canManage && e.preventDefault()}
                        aria-disabled={!canManage}
                        title={!canManage ? "You don't have permission to add drafts" : ""}
                    >
                        Add Draft
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Draft ID</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Amount</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drafts.map((draft: Draft) => (
                            <tr key={draft.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="px-6 py-4">{new Date(draft.date).toLocaleString()}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{draft.id}</th>
                                <td className="px-6 py-4">{draft.customer.name}</td>
                                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(draft.total)}</td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    <Link to={`/sell/drafts/edit/${draft.id}`} className={`font-medium text-indigo-600 dark:text-indigo-500 hover:underline ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={(e) => !canManage && e.preventDefault()}>Edit</Link>
                                    <button onClick={() => handleDelete(draft)} disabled={!canManage} className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Delete</button>
                                </td>
                            </tr>
                        ))}
                         {drafts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No drafts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListDraftsPage;