

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';

const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

const AddProductPage: React.FC = () => {
    const { brands, categories, units, businessLocations, addProduct, hasPermission } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        categoryId: categories[0]?.id || '',
        brandId: brands[0]?.id || '',
        unitId: units[0]?.id || '',
        businessLocationId: businessLocations[0]?.id || '',
        costPrice: 0,
        price: 0,
        stock: 0,
        reorderPoint: 0,
        isNotForSale: false,
    });
    const [errors, setErrors] = useState({ name: '', sku: '', costPrice: '', price: '' });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    if (!hasPermission('products:add')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to add new products.
                </p>
                 <Link
                    to="/products"
                    className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    Back to Products
                </Link>
            </div>
        );
    }
    
    const validate = () => {
        const newErrors = { name: '', sku: '', costPrice: '', price: '' };
        let isValid = true;
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required.';
            isValid = false;
        }
        if (!formData.sku.trim()) {
            newErrors.sku = 'SKU is required.';
            isValid = false;
        }
        if (formData.costPrice <= 0) {
            newErrors.costPrice = 'Cost Price must be a positive number.';
            isValid = false;
        }
        if (formData.price <= 0) {
            newErrors.price = 'Selling Price must be a positive number.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };
    
    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
           processFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            addProduct(formData, imagePreview);
            navigate('/products');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            const numValue = (name === 'price' || name === 'stock' || name === 'reorderPoint' || name === 'costPrice') ? parseFloat(value) : value;
            setFormData(prev => ({ ...prev, [name]: numValue }));
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 border-b dark:border-slate-700">
                    <h1 className="text-2xl font-bold">Add New Product</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Fill in the details for the new product.</p>
                </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Product Name*</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`} />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium">SKU*</label>
                            <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} className={`${baseInputClasses} ${errors.sku ? errorInputClasses : ''}`} />
                            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                        </div>
                        <div>
                            <label htmlFor="costPrice" className="block text-sm font-medium">Cost Price*</label>
                            <input type="number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleChange} step="0.01" min="0" className={`${baseInputClasses} ${errors.costPrice ? errorInputClasses : ''}`} />
                            {errors.costPrice && <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>}
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium">Selling Price*</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" className={`${baseInputClasses} ${errors.price ? errorInputClasses : ''}`} />
                            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                        </div>
                         <div>
                            <label htmlFor="stock" className="block text-sm font-medium">Initial Stock</label>
                            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} min="0" className={baseInputClasses} />
                        </div>
                         <div>
                            <label htmlFor="reorderPoint" className="block text-sm font-medium">Reorder Point</label>
                            <input type="number" id="reorderPoint" name="reorderPoint" value={formData.reorderPoint} onChange={handleChange} min="0" className={baseInputClasses} />
                        </div>
                         <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium">Category</label>
                            <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className={baseInputClasses}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="brandId" className="block text-sm font-medium">Brand</label>
                            <select id="brandId" name="brandId" value={formData.brandId} onChange={handleChange} className={baseInputClasses}>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="unitId" className="block text-sm font-medium">Unit</label>
                            <select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange} className={baseInputClasses}>
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="businessLocationId" className="block text-sm font-medium">Business Location*</label>
                            <select id="businessLocationId" name="businessLocationId" value={formData.businessLocationId} onChange={handleChange} className={baseInputClasses}>
                                {businessLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="isNotForSale"
                                        name="isNotForSale"
                                        type="checkbox"
                                        checked={formData.isNotForSale}
                                        onChange={handleChange}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isNotForSale" className="font-medium text-gray-700 dark:text-gray-300">This product is not for sale</label>
                                    <p className="text-gray-500 dark:text-gray-400">If checked, it won't appear in the POS screen.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium">Product Image</label>
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md h-64 transition-colors duration-200 ${isDragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600'}`}
                        >
                            {imagePreview ? (
                                <div className="relative text-center">
                                    <img src={imagePreview} alt="Product preview" className="mx-auto max-h-52 w-auto rounded-lg object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => setImagePreview(null)}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none hover:bg-red-700 shadow-md"
                                        aria-label="Remove image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                        PNG, JPG, GIF up to 10MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Add Product</button>
                </div>
            </form>
        </div>
    );
};

export default AddProductPage;