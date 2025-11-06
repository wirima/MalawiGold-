import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StockTransferRequest } from '../types';

const StockTransferRequestsPage: React.FC = () => {
    const { 
        stockTransferRequests, 
        updateStockTransferRequest,
        products, 
        users, 
        businessLocations, 
        hasPermission 
    } = useAuth();

    if (!hasPermission('stock_transfer:manage')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to manage stock transfer requests.
                </p>
            </div>
        );
    }

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const locationsMap = useMemo(() => new Map(businessLocations.map(l => [l.id, l.name])), [businessLocations]);

    const getStatusBadge = (status: StockTransferRequest['status']) => {
        switch (status) {
            case 'pending':
                return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs font-medium">Pending</span>;
            case 'approved':
                return <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">Approved</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full text-xs font-medium">Rejected</span>;
            default:
                return <span className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-medium">Unknown</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold">Stock Transfer Requests</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve or reject transfer requests from other locations.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Product</th>
                            <th scope="col" className="px-6 py-3">From</th>
                            <th scope="col" className="px-6 py-3">To</th>
                            <th scope="col" className="px-6 py-3 text-center">Qty</th>
                            <th scope="col" className="px-6 py-3">Requested By</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockTransferRequests.length > 0 ? stockTransferRequests.map(req => {
                            const product = productsMap.get(req.productId);
                            return (
                                <tr key={req.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(req.date).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{product?.name || 'Unknown Product'} ({product?.sku})</td>
                                    <td className="px-6 py-4">{locationsMap.get(req.fromLocationId) || 'Unknown'}</td>
                                    <td className="px-6 py-4">{locationsMap.get(req.toLocationId) || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-center">{req.quantity}</td>
                                    <td className="px-6 py-4">{usersMap.get(req.requestingUserId) || 'Unknown User'}</td>
                                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateStockTransferRequest(req.id, 'approved')} className="font-medium text-green-600 dark:text-green-500 hover:underline">Approve</button>
                                                <button onClick={() => updateStockTransferRequest(req.id, 'rejected')} className="font-medium text-red-600 dark:text-red-500 hover:underline">Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    There are no pending stock transfer requests.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTransferRequestsPage;