import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotFoundPage from './NotFoundPage';

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const { products, brands, categories, units, businessLocations } = useAuth();

    const product = products.find(p => p.id === productId);

    if (!product) {
        return <NotFoundPage />;
    }

    const brand = brands.find(b => b.id === product.brandId)?.name || 'N/A';
    const category = categories.find(c => c.id === product.categoryId)?.name || 'N/A';
    const unit = units.find(u => u.id === product.unitId)?.name || 'N/A';
    const location = businessLocations.find(l => l.id === product.businessLocationId)?.name || 'N/A';

    const getStockStatus = () => {
        if (product.stock === 0) return { text: 'Out of Stock', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        if (product.stock <= product.reorderPoint) return { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        return { text: 'In Stock', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    };

    const stockStatus = getStockStatus();

    return (
        <div>
             <div className="mb-4">
                <Link to="/products" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">&larr; Back to Products</Link>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        <img className="h-48 w-full object-cover md:h-full md:w-64" src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="p-8 flex-1">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 dark:text-indigo-400 font-semibold">{category}</div>
                        <h1 className="block mt-1 text-3xl leading-tight font-bold text-black dark:text-white">{product.name}</h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
                        
                        <div className="mt-6">
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400"> / {unit}</span>
                             <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Cost: {product.costPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center">
                                {product.isNotForSale ? (
                                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>
                                        Not for Sale
                                    </span>
                                ) : (
                                    <>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.className}`}>
                                            {stockStatus.text}
                                        </span>
                                        <span className="ml-4 text-slate-700 dark:text-slate-300">{product.stock} units available</span>
                                    </>
                                )}
                            </div>
                             {!product.isNotForSale && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Reorder point: {product.reorderPoint} units</p>}
                        </div>
                        
                        <div className="mt-6 border-t dark:border-slate-700 pt-4">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Brand:</dt>
                                    <dd className="font-medium text-slate-800 dark:text-slate-200">{brand}</dd>
                                </div>
                                <div className="flex justify-between">
                                     <dt className="text-slate-500">Location:</dt>
                                    <dd className="font-medium text-slate-800 dark:text-slate-200">{location}</dd>
                                </div>
                                <div className="flex justify-between">
                                     <dt className="text-slate-500">Category:</dt>
                                    <dd className="font-medium text-slate-800 dark:text-slate-200">{category}</dd>
                                </div>
                                <div className="flex justify-between">
                                     <dt className="text-slate-500">Unit:</dt>
                                    <dd className="font-medium text-slate-800 dark:text-slate-200">{unit}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;