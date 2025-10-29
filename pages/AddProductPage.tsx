import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Product, BarcodeType, Brand } from '../types';

const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

const BARCODE_TYPES: { value: BarcodeType, label: string }[] = [
    { value: 'CODE128', label: 'Code 128 (C128)' },
    { value: 'CODE39', label: 'Code 39 (C39)' },
    { value: 'EAN13', label: 'EAN-13' },
    { value: 'EAN8', label: 'EAN-8' },
    { value: 'UPC', label: 'UPC-A' },
    { value: 'UPCE', label: 'UPC-E' },
];

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <span className="group relative ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 cursor-help" fill="none" viewBox="0 0 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="absolute bottom-full mb-2 w-72 scale-0 rounded bg-slate-800 p-2 text-xs text-white transition-all group-hover:scale-100 left-1/2 -translate-x-1/2 z-10">
            {text}
        </span>
    </span>
);


const AddProductPage: React.FC = () => {
    const { brands, categories, units, businessLocations, addProduct, hasPermission, addBrand } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Omit<Product, 'id' | 'imageUrl' | 'brandId'>>({
        name: '',
        sku: '',
        categoryId: categories[0]?.id || '',
        unitId: units[0]?.id || '',
        businessLocationId: businessLocations[0]?.id || '',
        costPrice: 0,
        price: 0,
        stock: 0,
        reorderPoint: 0,
        isNotForSale: false,
        productType: 'single',
        barcodeType: 'CODE128',
        description: '',
        taxAmount: 0,
        taxType: 'percentage',
    });
    
    const [brandName, setBrandName] = useState('');
    const [brandSuggestions, setBrandSuggestions] = useState<Brand[]>([]);
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState({ name: '', sku: '', costPrice: '', price: '', brand: '' });

    if (!hasPermission('products:add')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold text-slate-700 dark:text-slate-300">Access Denied</h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    You do not have permission to add products.
                </p>
                <Link to="/products" className="mt-6 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Back to Products
                </Link>
            </div>
        );
    }

    const validate = () => {
        const newErrors = { name: '', sku: '', costPrice: '', price: '', brand: '' };
        let isValid = true;
        if (!formData.name.trim()) { newErrors.name = 'Product name is required.'; isValid = false; }
        if (!formData.sku.trim()) { newErrors.sku = 'SKU is required.'; isValid = false; }
        if (formData.costPrice <= 0) { newErrors.costPrice = 'Cost price must be a positive number.'; isValid = false; }
        if (formData.price <= 0) { newErrors.price = 'Selling price must be a positive number.'; isValid = false; }
        if (!brandName.trim()) { newErrors.brand = 'Brand is required.'; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            // Find or create brand
            let brandId: string;
            const existingBrand = brands.find(b => b.name.toLowerCase() === brandName.trim().toLowerCase());
            if (existingBrand) {
                brandId = existingBrand.id;
            } else {
                const newBrand = addBrand({ name: brandName.trim() });
                brandId = newBrand.id;
            }

            const productData = { ...formData, brandId };
            addProduct(productData, imagePreview);
            navigate('/products');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            const numValue = ['price', 'stock', 'reorderPoint', 'costPrice', 'taxAmount'].includes(name) ? parseFloat(value) || 0 : value;
            setFormData(prev => ({ ...prev, [name]: numValue }));
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBrandName(value);
        if (value) {
            setBrandSuggestions(
                brands.filter(b => b.name.toLowerCase().includes(value.toLowerCase()))
            );
            setShowBrandSuggestions(true);
        } else {
            setBrandSuggestions([]);
            setShowBrandSuggestions(false);
        }
    };

    const handleBrandSuggestionClick = (brand: Brand) => {
        setBrandName(brand.name);
        setShowBrandSuggestions(false);
    };


    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b dark:border-slate-700">
                    <h1 className="text-2xl font-bold">Add New Product</h1>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1 */}
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Product Name*</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`} />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sku" className="block text-sm font-medium">SKU*<Tooltip text="Stock Keeping Unit. Must be unique for each product." /></label>
                                <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} className={`${baseInputClasses} ${errors.sku ? errorInputClasses : ''}`} />
                                {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                            </div>
                            <div>
                                <label htmlFor="barcodeType" className="block text-sm font-medium">Barcode Type</label>
                                <select id="barcodeType" name="barcodeType" value={formData.barcodeType} onChange={handleChange} className={baseInputClasses}>
                                    {BARCODE_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="categoryId" className="block text-sm font-medium">Category</label>
                                <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className={baseInputClasses}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                             <div className="relative">
                                <label htmlFor="brandName" className="block text-sm font-medium">Brand*</label>
                                <input 
                                    type="text" 
                                    id="brandName" 
                                    name="brandName"
                                    value={brandName}
                                    onChange={handleBrandChange}
                                    onFocus={() => setShowBrandSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 150)} // Delay to allow click
                                    autoComplete="off"
                                    className={`${baseInputClasses} ${errors.brand ? errorInputClasses : ''}`} 
                                />
                                {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                                {showBrandSuggestions && brandSuggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 rounded-md shadow-lg border dark:border-slate-700 max-h-60 overflow-auto">
                                        {brandSuggestions.map(brand => (
                                            <li key={brand.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleBrandSuggestionClick(brand)}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                >
                                                    {brand.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="unitId" className="block text-sm font-medium">Unit</label>
                                <select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange} className={baseInputClasses}>
                                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="businessLocationId" className="block text-sm font-medium">Business Location</label>
                                <select id="businessLocationId" name="businessLocationId" value={formData.businessLocationId} onChange={handleChange} className={baseInputClasses}>
                                    {businessLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>

                         <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input id="isNotForSale" name="isNotForSale" type="checkbox" checked={formData.isNotForSale} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isNotForSale" className="font-medium text-gray-700 dark:text-gray-300">Not for selling</label>
                                <p className="text-gray-500 dark:text-gray-400">If checked, product will not be displayed in POS screen.</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Column 2 */}
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium">Product Image</label>
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Product Preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    )}
                                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium">Product Description</label>
                            <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} className={baseInputClasses}></textarea>
                        </div>
                    </div>

                    {/* Pricing and Stock */}
                    <div className="md:col-span-3 pt-4 border-t dark:border-slate-700">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Pricing & Stock</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <div className="sm:col-span-2 lg:col-span-2">
                                <label htmlFor="taxAmount" className="block text-sm font-medium">
                                    Tax
                                    <Tooltip text="Set the tax rate for this product. This can be a percentage or a fixed cash amount." />
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input 
                                        type="number" 
                                        name="taxAmount" 
                                        id="taxAmount" 
                                        value={formData.taxAmount || ''} 
                                        onChange={handleChange} 
                                        step="0.01" 
                                        min="0" 
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                                        placeholder="0.00" 
                                    />
                                    <select 
                                        name="taxType" 
                                        value={formData.taxType} 
                                        onChange={handleChange} 
                                        className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="stock" className="block text-sm font-medium">Initial Stock</label>
                                <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} min="0" className={baseInputClasses} />
                            </div>
                             <div>
                                <label htmlFor="reorderPoint" className="block text-sm font-medium">Reorder Point</label>
                                <input type="number" id="reorderPoint" name="reorderPoint" value={formData.reorderPoint} onChange={handleChange} min="0" className={baseInputClasses} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                    <Link to="/products" className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</Link>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save Product</button>
                </div>
            </div>
        </form>
    );
};

export default AddProductPage;